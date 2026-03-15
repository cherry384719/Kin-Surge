package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"kin-surge/server/internal/config"
	"kin-surge/server/internal/database"

	"github.com/gin-gonic/gin"
)

type testAuthResponse struct {
	User struct {
		ID          string `json:"id"`
		DisplayName string `json:"display_name"`
		Coins       int    `json:"coins"`
		IsGuest     bool   `json:"is_guest"`
	} `json:"user"`
}

type testDashboardResponse struct {
	Dynasties []struct {
		ID             uint   `json:"id"`
		DisplayName    string `json:"display_name"`
		Unlocked       bool   `json:"unlocked"`
		BossCompleted  bool   `json:"boss_completed"`
		CompletedPoets int    `json:"completed_poets"`
		TotalPoets     int    `json:"total_poets"`
	} `json:"dynasties"`
}

type testDynastyResponse struct {
	Poets []struct {
		ID        uint   `json:"id"`
		Name      string `json:"name"`
		IsBoss    bool   `json:"is_boss"`
		Unlocked  bool   `json:"unlocked"`
		Completed bool   `json:"completed"`
	} `json:"poets"`
}

type testChallengeResponse struct {
	Poet struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"poet"`
	Poems []struct {
		ID uint `json:"id"`
	} `json:"poems"`
	Lines []struct {
		ID uint `json:"id"`
	} `json:"lines"`
}

type testCompleteResponse struct {
	Passed          bool `json:"passed"`
	Stars           int  `json:"stars"`
	CoinsEarned     int  `json:"coins_earned"`
	FirstClearBonus int  `json:"first_clear_bonus"`
	User            struct {
		Coins int `json:"coins"`
	} `json:"user"`
}

func TestRegisterDashboardAndChallengeFlow(t *testing.T) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	router := testRouter(t)

	registerBody := map[string]string{
		"username":     "tester",
		"display_name": "测试者",
		"password":     "secret123",
	}

	registerRecorder := performJSONRequest(t, router, http.MethodPost, "/api/auth/register", registerBody, "")
	if registerRecorder.Code != http.StatusCreated {
		t.Fatalf("expected register status 201, got %d: %s", registerRecorder.Code, registerRecorder.Body.String())
	}

	var registerPayload testAuthResponse
	decodeJSON(t, registerRecorder, &registerPayload)
	if registerPayload.User.DisplayName != "测试者" {
		t.Fatalf("expected display name to persist, got %q", registerPayload.User.DisplayName)
	}

	cookie := registerRecorder.Header().Get("Set-Cookie")
	if cookie == "" {
		t.Fatal("expected auth cookie to be set")
	}

	dashboardRecorder := performJSONRequest(t, router, http.MethodGet, "/api/dashboard", nil, cookie)
	if dashboardRecorder.Code != http.StatusOK {
		t.Fatalf("expected dashboard status 200, got %d: %s", dashboardRecorder.Code, dashboardRecorder.Body.String())
	}

	var dashboardPayload testDashboardResponse
	decodeJSON(t, dashboardRecorder, &dashboardPayload)
	if len(dashboardPayload.Dynasties) < 2 {
		t.Fatalf("expected seeded dynasties, got %d", len(dashboardPayload.Dynasties))
	}
	if !dashboardPayload.Dynasties[0].Unlocked {
		t.Fatal("expected first dynasty to be unlocked")
	}
	if dashboardPayload.Dynasties[1].Unlocked {
		t.Fatal("expected second dynasty to be locked before boss clear")
	}

	dynastyRecorder := performJSONRequest(t, router, http.MethodGet, "/api/dynasties/1", nil, cookie)
	if dynastyRecorder.Code != http.StatusOK {
		t.Fatalf("expected dynasty status 200, got %d: %s", dynastyRecorder.Code, dynastyRecorder.Body.String())
	}

	var dynastyPayload testDynastyResponse
	decodeJSON(t, dynastyRecorder, &dynastyPayload)
	if len(dynastyPayload.Poets) < 2 {
		t.Fatalf("expected seeded poets, got %d", len(dynastyPayload.Poets))
	}
	if !dynastyPayload.Poets[0].Unlocked {
		t.Fatal("expected first poet to be unlocked")
	}
	if dynastyPayload.Poets[1].Unlocked {
		t.Fatal("expected second poet to be locked before first clear")
	}

	firstPoetID := dynastyPayload.Poets[0].ID
	challengeRecorder := performJSONRequest(t, router, http.MethodGet, "/api/challenges/poets/"+uintToString(firstPoetID), nil, cookie)
	if challengeRecorder.Code != http.StatusOK {
		t.Fatalf("expected challenge status 200, got %d: %s", challengeRecorder.Code, challengeRecorder.Body.String())
	}

	var challengePayload testChallengeResponse
	decodeJSON(t, challengeRecorder, &challengePayload)
	if len(challengePayload.Poems) == 0 || len(challengePayload.Lines) == 0 {
		t.Fatal("expected challenge to include seeded poems and lines")
	}

	completeRecorder := performJSONRequest(t, router, http.MethodPost, "/api/challenges/poets/"+uintToString(firstPoetID)+"/complete", map[string]int{
		"correct_answers": 4,
		"total_questions": 6,
		"mistakes":        1,
	}, cookie)
	if completeRecorder.Code != http.StatusOK {
		t.Fatalf("expected challenge complete status 200, got %d: %s", completeRecorder.Code, completeRecorder.Body.String())
	}

	var completePayload testCompleteResponse
	decodeJSON(t, completeRecorder, &completePayload)
	if !completePayload.Passed {
		t.Fatal("expected challenge to pass at 4/6")
	}
	if completePayload.Stars != 2 {
		t.Fatalf("expected 2 stars for one mistake, got %d", completePayload.Stars)
	}
	if completePayload.FirstClearBonus != 30 {
		t.Fatalf("expected first clear bonus 30, got %d", completePayload.FirstClearBonus)
	}
	if completePayload.User.Coins != completePayload.CoinsEarned {
		t.Fatalf("expected user coins to equal earned coins after first clear, got %d vs %d", completePayload.User.Coins, completePayload.CoinsEarned)
	}

	dynastyRecorder = performJSONRequest(t, router, http.MethodGet, "/api/dynasties/1", nil, cookie)
	decodeJSON(t, dynastyRecorder, &dynastyPayload)
	if !dynastyPayload.Poets[1].Unlocked {
		t.Fatal("expected second poet to unlock after first poet clear")
	}
}

func TestGuestSessionAndProtectedRoute(t *testing.T) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	router := testRouter(t)

	guestRecorder := performJSONRequest(t, router, http.MethodPost, "/api/auth/guest", nil, "")
	if guestRecorder.Code != http.StatusCreated {
		t.Fatalf("expected guest status 201, got %d: %s", guestRecorder.Code, guestRecorder.Body.String())
	}

	var guestPayload testAuthResponse
	decodeJSON(t, guestRecorder, &guestPayload)
	if !guestPayload.User.IsGuest {
		t.Fatal("expected guest account to be marked as guest")
	}

	cookie := guestRecorder.Header().Get("Set-Cookie")
	meRecorder := performJSONRequest(t, router, http.MethodGet, "/api/auth/me", nil, cookie)
	if meRecorder.Code != http.StatusOK {
		t.Fatalf("expected me status 200, got %d: %s", meRecorder.Code, meRecorder.Body.String())
	}

	unauthorizedRecorder := performJSONRequest(t, router, http.MethodGet, "/api/dashboard", nil, "")
	if unauthorizedRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized dashboard status 401, got %d", unauthorizedRecorder.Code)
	}
}

func testRouter(t *testing.T) *gin.Engine {
	t.Helper()

	cfg := config.Config{
		Port:         "0",
		DatabasePath: filepath.Join(t.TempDir(), "kinsurge-test.db"),
		JWTSecret:    "test-secret",
		AppEnv:       "test",
		AllowOrigins: []string{"http://localhost:5173"},
		DistDir:      filepath.Join(t.TempDir(), "dist"),
	}

	db, err := database.Open(cfg)
	if err != nil {
		t.Fatalf("open database: %v", err)
	}

	return NewRouter(db, cfg)
}

func performJSONRequest(t *testing.T, router *gin.Engine, method string, path string, body any, cookie string) *httptest.ResponseRecorder {
	t.Helper()

	var buffer *bytes.Reader
	if body == nil {
		buffer = bytes.NewReader(nil)
	} else {
		payload, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		buffer = bytes.NewReader(payload)
	}

	request := httptest.NewRequest(method, path, buffer)
	request.Header.Set("Content-Type", "application/json")
	if cookie != "" {
		request.Header.Set("Cookie", cookie)
	}

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)
	return recorder
}

func decodeJSON[T any](t *testing.T, recorder *httptest.ResponseRecorder, target *T) {
	t.Helper()
	if err := json.Unmarshal(recorder.Body.Bytes(), target); err != nil {
		t.Fatalf("decode json: %v; body=%s", err, recorder.Body.String())
	}
}

