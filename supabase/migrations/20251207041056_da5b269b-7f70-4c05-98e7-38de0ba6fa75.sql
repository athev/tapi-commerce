
-- Update reviews with diverse comments only (can't create fake profiles due to FK constraint)
DO $$
DECLARE
  comments text[] := ARRAY[
    'Sản phẩm tốt, đáng tiền 👍',
    'Xài ngon, recommend!',
    'Đã dùng 2 tuần, mọi thứ hoàn hảo',
    'Lần đầu mua ở đây, bất ngờ vì chất lượng tốt quá!',
    'Shop phản hồi nhanh, hướng dẫn cài đặt rõ ràng',
    'Mua lần 2 rồi, vẫn ưng như lần đầu',
    'Giá rẻ hơn chỗ khác nhiều mà chất lượng tương đương',
    'Ok lắm',
    'Giao dịch nhanh gọn, sản phẩm hoạt động tốt',
    'Rất hài lòng với sản phẩm này ❤️',
    'Cảm ơn shop, sản phẩm đúng mô tả',
    'Đã giới thiệu cho bạn bè, ai cũng khen',
    'Chất lượng vượt mong đợi so với giá tiền',
    'Dùng được 1 tháng rồi, vẫn ổn định',
    'Tuyệt vời! Sẽ ủng hộ shop dài dài',
    'Sản phẩm chính hãng, yên tâm sử dụng',
    'Hỗ trợ nhiệt tình, đáng 5 sao ⭐',
    'Mình đã so sánh nhiều nơi, đây là tốt nhất',
    'Giao hàng siêu nhanh luôn',
    'Đóng gói cẩn thận, sản phẩm nguyên vẹn',
    'Ưng quá, lần sau sẽ mua tiếp',
    'Giá hợp lý, chất lượng ổn',
    'Shop tư vấn nhiệt tình, cảm ơn nhiều',
    'Sản phẩm như mô tả, không có gì phàn nàn',
    'Đáng đồng tiền bát gạo 💯',
    'Mua cho cả team dùng, ai cũng thích',
    'Đã test kỹ, hoạt động perfect',
    'Recommend cho mọi người',
    'Chưa bao giờ thất vọng khi mua ở đây',
    'Sản phẩm xịn, giá sinh viên 👌',
    'Nhanh - Gọn - Lẹ, 5 sao!',
    'Mình khó tính mà vẫn hài lòng',
    'Đợt này có khuyến mãi nên mua luôn 2 cái',
    'Cài đặt dễ dàng, hướng dẫn chi tiết',
    'Sẽ quay lại ủng hộ shop',
    'Chất lượng tốt, giao dịch uy tín',
    'Mua lần 3 rồi, không có gì để chê',
    'Shop nhiệt tình, sản phẩm ok',
    'Đúng như review, rất đáng mua',
    'Cảm ơn shop đã hỗ trợ kịp thời',
    'Sản phẩm chất lượng, giá cả phải chăng',
    'Mình đã thử nhiều nơi, đây là số 1',
    'Giao dịch suôn sẻ, sản phẩm như ý',
    'Đánh giá 5 sao vì xứng đáng',
    'Shop uy tín, mua yên tâm',
    'Sản phẩm tốt, sẽ giới thiệu cho bạn bè',
    'Đã dùng thử, rất ưng ý 😊',
    'Mua ngay kẻo hết khuyến mãi!',
    'Chất lượng vượt trội so với giá',
    'Hài lòng 100%, cảm ơn shop!'
  ];
  review_record record;
  comment_index int;
  counter int := 0;
BEGIN
  FOR review_record IN SELECT id FROM reviews ORDER BY random() LOOP
    counter := counter + 1;
    -- Use modulo to cycle through comments, ensuring each comment is used roughly equally
    comment_index := ((counter - 1) % 50) + 1;
    
    UPDATE reviews 
    SET comment = comments[comment_index]
    WHERE id = review_record.id;
  END LOOP;
END $$;
