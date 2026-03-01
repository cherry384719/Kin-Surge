-- Additional poems for expanded content (Phase 1)
-- Adds new poems across all dynasties using dynamic poet references

-- ---- 李白 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='李白'), 3, '望庐山瀑布', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '早发白帝城', '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '赠汪伦', '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '望天门山', '天门中断楚江开，碧水东流至此回。两岸青山相对出，孤帆一片日边来。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '独坐敬亭山', '众鸟高飞尽，孤云独去闲。相看两不厌，只有敬亭山。', '小学');

-- ---- 杜甫 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '绝句（两个黄鹂）', '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', '小学'),
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '春夜喜雨', '好雨知时节，当春乃发生。随风潜入夜，润物细无声。', '小学'),
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '江畔独步寻花', '黄四娘家花满蹊，千朵万朵压枝低。留连戏蝶时时舞，自在娇莺恰恰啼。', '小学');

-- ---- 白居易 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='白居易'), 3, '赋得古原草送别', '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。', '小学'),
  ((SELECT id FROM poets WHERE name='白居易'), 3, '忆江南', '江南好，风景旧曾谙。日出江花红胜火，春来江水绿如蓝。能不忆江南？', '小学'),
  ((SELECT id FROM poets WHERE name='白居易'), 3, '池上', '小娃撑小艇，偷采白莲回。不解藏踪迹，浮萍一道开。', '小学');

-- ---- 王维 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='王维'), 3, '送元二使安西', '渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。', '小学'),
  ((SELECT id FROM poets WHERE name='王维'), 3, '鹿柴', '空山不见人，但闻人语响。返景入深林，复照青苔上。', '小学'),
  ((SELECT id FROM poets WHERE name='王维'), 3, '山居秋暝', '空山新雨后，天气晚来秋。明月松间照，清泉石上流。', '初中');

-- ---- 苏轼 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '题西林壁', '横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。', '小学'),
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '饮湖上初晴后雨', '水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。', '小学'),
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '惠崇春江晚景', '竹外桃花三两枝，春江水暖鸭先知。蒌蒿满地芦芽短，正是河豚欲上时。', '小学');

-- ---- 李清照 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='李清照'), 4, '如梦令', '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。', '初中'),
  ((SELECT id FROM poets WHERE name='李清照'), 4, '夏日绝句', '生当作人杰，死亦为鬼雄。至今思项羽，不肯过江东。', '小学');

-- ---- 辛弃疾 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='辛弃疾'), 4, '清平乐·村居', '茅檐低小，溪上青青草。醉里吴音相媚好，白发谁家翁媪？', '小学'),
  ((SELECT id FROM poets WHERE name='辛弃疾'), 4, '西江月·夜行黄沙道中', '明月别枝惊鹊，清风半夜鸣蝉。稻花香里说丰年，听取蛙声一片。', '初中');

-- ---- 陆游 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='陆游'), 4, '示儿', '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。', '小学'),
  ((SELECT id FROM poets WHERE name='陆游'), 4, '游山西村', '莫笑农家腊酒浑，丰年留客足鸡豚。山重水复疑无路，柳暗花明又一村。', '初中');

-- ---- 龚自珍 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='龚自珍'), 6, '己亥杂诗·其五', '浩荡离愁白日斜，吟鞭东指即天涯。落红不是无情物，化作春泥更护花。', '初中');

-- ============================================================
-- POEM LINES for new poems
-- ============================================================

-- 李白 - 望庐山瀑布
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '日照香炉生紫烟' WHEN 2 THEN '遥看瀑布挂前川'
  WHEN 3 THEN '飞流直下三千尺' WHEN 4 THEN '疑是银河落九天'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '望庐山瀑布' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 早发白帝城
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '朝辞白帝彩云间' WHEN 2 THEN '千里江陵一日还'
  WHEN 3 THEN '两岸猿声啼不住' WHEN 4 THEN '轻舟已过万重山'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '早发白帝城' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 赠汪伦
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '李白乘舟将欲行' WHEN 2 THEN '忽闻岸上踏歌声'
  WHEN 3 THEN '桃花潭水深千尺' WHEN 4 THEN '不及汪伦送我情'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '赠汪伦' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 望天门山
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '天门中断楚江开' WHEN 2 THEN '碧水东流至此回'
  WHEN 3 THEN '两岸青山相对出' WHEN 4 THEN '孤帆一片日边来'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '望天门山' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 独坐敬亭山
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '众鸟高飞尽' WHEN 2 THEN '孤云独去闲'
  WHEN 3 THEN '相看两不厌' WHEN 4 THEN '只有敬亭山'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '独坐敬亭山' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 杜甫 - 绝句（两个黄鹂）
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '两个黄鹂鸣翠柳' WHEN 2 THEN '一行白鹭上青天'
  WHEN 3 THEN '窗含西岭千秋雪' WHEN 4 THEN '门泊东吴万里船'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '绝句（两个黄鹂）' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 杜甫 - 春夜喜雨
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '好雨知时节' WHEN 2 THEN '当春乃发生'
  WHEN 3 THEN '随风潜入夜' WHEN 4 THEN '润物细无声'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '春夜喜雨' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 杜甫 - 江畔独步寻花
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '黄四娘家花满蹊' WHEN 2 THEN '千朵万朵压枝低'
  WHEN 3 THEN '留连戏蝶时时舞' WHEN 4 THEN '自在娇莺恰恰啼'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '江畔独步寻花' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 白居易 - 赋得古原草送别
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '离离原上草' WHEN 2 THEN '一岁一枯荣'
  WHEN 3 THEN '野火烧不尽' WHEN 4 THEN '春风吹又生'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '赋得古原草送别' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 白居易 - 忆江南
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '江南好' WHEN 2 THEN '风景旧曾谙'
  WHEN 3 THEN '日出江花红胜火' WHEN 4 THEN '春来江水绿如蓝'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '忆江南' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 白居易 - 池上
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '小娃撑小艇' WHEN 2 THEN '偷采白莲回'
  WHEN 3 THEN '不解藏踪迹' WHEN 4 THEN '浮萍一道开'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '池上' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 王维 - 送元二使安西
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '渭城朝雨浥轻尘' WHEN 2 THEN '客舍青青柳色新'
  WHEN 3 THEN '劝君更尽一杯酒' WHEN 4 THEN '西出阳关无故人'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '送元二使安西' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 王维 - 鹿柴
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '空山不见人' WHEN 2 THEN '但闻人语响'
  WHEN 3 THEN '返景入深林' WHEN 4 THEN '复照青苔上'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '鹿柴' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 王维 - 山居秋暝
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '空山新雨后' WHEN 2 THEN '天气晚来秋'
  WHEN 3 THEN '明月松间照' WHEN 4 THEN '清泉石上流'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '山居秋暝' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 苏轼 - 题西林壁
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '横看成岭侧成峰' WHEN 2 THEN '远近高低各不同'
  WHEN 3 THEN '不识庐山真面目' WHEN 4 THEN '只缘身在此山中'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '题西林壁' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 苏轼 - 饮湖上初晴后雨
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '水光潋滟晴方好' WHEN 2 THEN '山色空蒙雨亦奇'
  WHEN 3 THEN '欲把西湖比西子' WHEN 4 THEN '淡妆浓抹总相宜'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '饮湖上初晴后雨' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 苏轼 - 惠崇春江晚景
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '竹外桃花三两枝' WHEN 2 THEN '春江水暖鸭先知'
  WHEN 3 THEN '蒌蒿满地芦芽短' WHEN 4 THEN '正是河豚欲上时'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '惠崇春江晚景' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 李清照 - 如梦令
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '常记溪亭日暮' WHEN 2 THEN '沉醉不知归路'
  WHEN 3 THEN '兴尽晚回舟' WHEN 4 THEN '误入藕花深处'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '如梦令' AND p.poet_id = (SELECT id FROM poets WHERE name='李清照');

-- 李清照 - 夏日绝句
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '生当作人杰' WHEN 2 THEN '死亦为鬼雄'
  WHEN 3 THEN '至今思项羽' WHEN 4 THEN '不肯过江东'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '夏日绝句' AND p.poet_id = (SELECT id FROM poets WHERE name='李清照');

-- 辛弃疾 - 清平乐·村居
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '茅檐低小' WHEN 2 THEN '溪上青青草'
  WHEN 3 THEN '醉里吴音相媚好' WHEN 4 THEN '白发谁家翁媪'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '清平乐·村居' AND p.poet_id = (SELECT id FROM poets WHERE name='辛弃疾');

-- 辛弃疾 - 西江月·夜行黄沙道中
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '明月别枝惊鹊' WHEN 2 THEN '清风半夜鸣蝉'
  WHEN 3 THEN '稻花香里说丰年' WHEN 4 THEN '听取蛙声一片'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '西江月·夜行黄沙道中' AND p.poet_id = (SELECT id FROM poets WHERE name='辛弃疾');

-- 陆游 - 示儿
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '死去元知万事空' WHEN 2 THEN '但悲不见九州同'
  WHEN 3 THEN '王师北定中原日' WHEN 4 THEN '家祭无忘告乃翁'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '示儿' AND p.poet_id = (SELECT id FROM poets WHERE name='陆游');

-- 陆游 - 游山西村
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '莫笑农家腊酒浑' WHEN 2 THEN '丰年留客足鸡豚'
  WHEN 3 THEN '山重水复疑无路' WHEN 4 THEN '柳暗花明又一村'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '游山西村' AND p.poet_id = (SELECT id FROM poets WHERE name='陆游');

-- 龚自珍 - 己亥杂诗·其五
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '浩荡离愁白日斜' WHEN 2 THEN '吟鞭东指即天涯'
  WHEN 3 THEN '落红不是无情物' WHEN 4 THEN '化作春泥更护花'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '己亥杂诗·其五' AND p.poet_id = (SELECT id FROM poets WHERE name='龚自珍');
