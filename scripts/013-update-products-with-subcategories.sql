-- Update products with sub-categories based on their names and categories
-- This is an initial setup - you can modify these as needed

UPDATE products
SET 
  sub_category = CASE
    WHEN name LIKE '%Niacinamide%' THEN 'Niacinamide Serum'
    WHEN name LIKE '%Cleansing Oil%' THEN 'Oil Cleanser'
    WHEN name LIKE '%Relief Cream%' THEN 'Soothing Cream'
    WHEN name LIKE '%Snail Mucin%' THEN 'Hydrating Serum'
    WHEN name LIKE '%AHA%' OR name LIKE '%BHA%' THEN 'Chemical Exfoliant'
    WHEN name LIKE '%Retinol%' THEN 'Retinol Treatment'
    WHEN name LIKE '%Vitamin C%' THEN 'Brightening Serum'
    WHEN name LIKE '%SPF%' OR name LIKE '%Sunscreen%' THEN 'Sun Protection'
    WHEN name LIKE '%Toner%' THEN 'Hydrating Toner'
    WHEN name LIKE '%Essence%' THEN 'Treatment Essence'
    WHEN name LIKE '%Gel%' AND category LIKE '%Moisturizer%' THEN 'Gel Moisturizer'
    WHEN name LIKE '%Cream%' AND category LIKE '%Moisturizer%' THEN 'Cream Moisturizer'
    WHEN name LIKE '%Foam%' THEN 'Foam Cleanser'
    ELSE NULL
  END,
  sub_category_ru = CASE
    WHEN name LIKE '%Niacinamide%' THEN 'Сыворотка с ниацинамидом'
    WHEN name LIKE '%Cleansing Oil%' THEN 'Гидрофильное масло'
    WHEN name LIKE '%Relief Cream%' THEN 'Успокаивающий крем'
    WHEN name LIKE '%Snail Mucin%' THEN 'Увлажняющая сыворотка'
    WHEN name LIKE '%AHA%' OR name LIKE '%BHA%' THEN 'Химический эксфолиант'
    WHEN name LIKE '%Retinol%' THEN 'Ретинол'
    WHEN name LIKE '%Vitamin C%' THEN 'Осветляющая сыворотка'
    WHEN name LIKE '%SPF%' OR name LIKE '%Sunscreen%' THEN 'Солнцезащитный крем'
    WHEN name LIKE '%Toner%' THEN 'Увлажняющий тонер'
    WHEN name LIKE '%Essence%' THEN 'Эссенция'
    WHEN name LIKE '%Gel%' AND category LIKE '%Moisturizer%' THEN 'Гель-увлажнитель'
    WHEN name LIKE '%Cream%' AND category LIKE '%Moisturizer%' THEN 'Крем-увлажнитель'
    WHEN name LIKE '%Foam%' THEN 'Пенка для умывания'
    ELSE NULL
  END,
  sub_category_hy = CASE
    WHEN name LIKE '%Niacinamide%' THEN 'Նիացինամիդով շիճուկ'
    WHEN name LIKE '%Cleansing Oil%' THEN 'Յուղային մաքրիչ'
    WHEN name LIKE '%Relief Cream%' THEN 'Հանգստացնող քսուք'
    WHEN name LIKE '%Snail Mucin%' THEN 'Խոնավեցնող շիճուկ'
    WHEN name LIKE '%AHA%' OR name LIKE '%BHA%' THEN 'Քիմիական քորիչ'
    WHEN name LIKE '%Retinol%' THEN 'Ռետինոլ'
    WHEN name LIKE '%Vitamin C%' THEN 'Լուսավորող շիճուկ'
    WHEN name LIKE '%SPF%' OR name LIKE '%Sunscreen%' THEN 'Արևապաշտպան'
    WHEN name LIKE '%Toner%' THEN 'Խոնավեցնող թոներ'
    WHEN name LIKE '%Essence%' THEN 'Էսենցիա'
    WHEN name LIKE '%Gel%' AND category LIKE '%Moisturizer%' THEN 'Գել-խոնավեցուցիչ'
    WHEN name LIKE '%Cream%' AND category LIKE '%Moisturizer%' THEN 'Քսուք-խոնավեցուցիչ'
    WHEN name LIKE '%Foam%' THEN 'Փրփրային մաքրիչ'
    ELSE NULL
  END
WHERE id IS NOT NULL;
