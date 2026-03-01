-- Add challenge_intro column to poets table for pre-challenge dialogue
ALTER TABLE poets ADD COLUMN IF NOT EXISTS challenge_intro text DEFAULT '';

-- Populate intros for existing poets
UPDATE poets SET challenge_intro = '大风起兮！吾乃汉高祖刘邦，来，与我对诗！' WHERE name = '刘邦';
UPDATE poets SET challenge_intro = '力拔山兮气盖世！霸王项羽在此，你敢应战？' WHERE name = '项羽';
UPDATE poets SET challenge_intro = '对酒当歌，人生几何？曹操与你论诗！' WHERE name = '曹操';
UPDATE poets SET challenge_intro = '采菊东篱下，吾乃陶渊明，来品田园之趣。' WHERE name = '陶渊明';
UPDATE poets SET challenge_intro = '才高八斗又如何？曹植在此，请接招！' WHERE name = '曹植';
UPDATE poets SET challenge_intro = '池塘生春草，谢灵运与你共赏山水。' WHERE name = '谢灵运';
UPDATE poets SET challenge_intro = '吾乃诗仙李白，你可知我那首《静夜思》？来，接我一招！' WHERE name = '李白';
UPDATE poets SET challenge_intro = '忧国忧民，诗圣杜甫在此，你可知我的愁？' WHERE name = '杜甫';
UPDATE poets SET challenge_intro = '诗风通俗，人人能解。白居易来考考你！' WHERE name = '白居易';
UPDATE poets SET challenge_intro = '诗中有画，画中有诗。王维与你论禅。' WHERE name = '王维';
UPDATE poets SET challenge_intro = '此情可待成追忆。李商隐之诗，你可能解？' WHERE name = '李商隐';
UPDATE poets SET challenge_intro = '大江东去，浪淘尽千古风流人物。苏轼在此！' WHERE name = '苏轼';
UPDATE poets SET challenge_intro = '知否知否？易安居士李清照，与你共话诗词。' WHERE name = '李清照';
UPDATE poets SET challenge_intro = '醉里挑灯看剑！辛弃疾向你发起挑战！' WHERE name = '辛弃疾';
UPDATE poets SET challenge_intro = '王师北定中原日，陆游之志，你可曾知？' WHERE name = '陆游';
UPDATE poets SET challenge_intro = '枯藤老树昏鸦，马致远的秋思，你可知晓？' WHERE name = '马致远';
UPDATE poets SET challenge_intro = '关汉卿在此，元曲之妙，且听我道来。' WHERE name = '关汉卿';
UPDATE poets SET challenge_intro = '粉骨碎身浑不怕！于谦在此，来对诗吧！' WHERE name = '于谦';
UPDATE poets SET challenge_intro = '人生若只如初见。纳兰性德与你共赏词章。' WHERE name = '纳兰性德';
UPDATE poets SET challenge_intro = '我劝天公重抖擞！龚自珍在此论诗。' WHERE name = '龚自珍';

-- Boss poets get generic intros
UPDATE poets SET challenge_intro = '汉朝诗词综合大考验，准备好了吗？' WHERE name = '汉朝综合';
UPDATE poets SET challenge_intro = '魏晋风骨综合考验，你能全部通过吗？' WHERE name = '魏晋综合';
UPDATE poets SET challenge_intro = '唐朝诗词博大精深，综合挑战等你来！' WHERE name = '唐朝综合';
UPDATE poets SET challenge_intro = '宋词之美，综合大考验开始！' WHERE name = '宋朝综合';
UPDATE poets SET challenge_intro = '元曲精华综合挑战，你准备好了吗？' WHERE name = '元朝综合';
UPDATE poets SET challenge_intro = '明清诗词综合大考验，最终关卡！' WHERE name = '明清综合';
