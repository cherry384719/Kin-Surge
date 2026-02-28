insert into dynasties (name, display_name, sort_order) values
  ('han', '汉朝', 1),
  ('tang', '唐朝', 2),
  ('song', '宋朝', 3);

insert into poets (dynasty_id, name, bio_short) values
  (2, '李白', '字太白，号青莲居士，唐代伟大浪漫主义诗人'),
  (2, '杜甫', '字子美，唐代伟大现实主义诗人'),
  (3, '苏轼', '字子瞻，号东坡居士，北宋文学家');

insert into poems (poet_id, dynasty_id, title, full_text, curriculum_grade) values
  (1, 2, '静夜思', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '一年级'),
  (1, 2, '望庐山瀑布', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '二年级');

insert into poem_lines (poem_id, line_number, text) values
  (1, 1, '床前明月光'),
  (1, 2, '疑是地上霜'),
  (1, 3, '举头望明月'),
  (1, 4, '低头思故乡'),
  (2, 1, '日照香炉生紫烟'),
  (2, 2, '遥看瀑布挂前川'),
  (2, 3, '飞流直下三千尺'),
  (2, 4, '疑是银河落九天');
