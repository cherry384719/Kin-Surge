package httpapi

import "strconv"

func uintToString(value uint) string {
	return strconv.Itoa(int(value))
}
