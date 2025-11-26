-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_hy TEXT NOT NULL,
  description_en TEXT,
  description_ru TEXT,
  description_hy TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert categories
INSERT INTO categories (id, name_en, name_ru, name_hy, description_en, description_ru, description_hy, display_order)
VALUES
  ('serums', 'Serums', 'Сыворотки', 'Հյութեր', 'Concentrated formulas for targeted concerns', 'Концентрированные формулы для целевых проблем', 'Խտացված բանաձևեր նպատակային խնդիրների համար', 1),
  ('cleansers', 'Cleansers', 'Очищающие средства', 'Մաքրողներ', 'Remove makeup, dirt and impurities', 'Удаление макияжа, грязи и примесей', 'Հեռացնել կոսմետիկան, կեղտը և աղտոտումները', 2),
  ('moisturizers', 'Moisturizers', 'Увлажняющие средства', 'Խոնավացուցիչներ', 'Hydrate and protect skin barrier', 'Увлажняют и защищают кожный барьер', 'Խոնավեցնել և պաշտպանել մաշկի արգելքը', 3),
  ('toners', 'Toners', 'Тоники', 'Տոներներ', 'Balance pH and prep skin', 'Баланс pH и подготовка кожи', 'Հավասարակշռել pH-ն և պատրաստել մաշկը', 4),
  ('treatments', 'Treatments', 'Лечебные средства', 'Բուժումներ', 'Active treatments for specific concerns', 'Активные средства для конкретных проблем', 'Ակտիվ բուժում հատուկ խնդիրների համար', 5),
  ('sunscreens', 'Sunscreens', 'Солнцезащитные средства', 'Արևապաշտպան միջոցներ', 'Broad spectrum UV protection', 'Широкий спектр UV защиты', 'Լայնածավալ UV պաշտպանություն', 6),
  ('exfoliants', 'Exfoliants', 'Эксфолианты', 'Քերիչներ', 'Remove dead skin cells', 'Удаление мертвых клеток кожи', 'Հեռացնել մեռած մաշկի բջիջները', 7),
  ('masks', 'Masks', 'Маски', 'Դիմակներ', 'Intensive treatments and pampering', 'Интенсивный уход и баловство', 'Ինտենսիվ խնամք և փայփայուն', 8),
  ('essences', 'Essences', 'Эссенции', 'Էսենցիաներ', 'Lightweight hydration and active delivery', 'Легкое увлажнение и доставка активных веществ', 'Թեթև խոնավացում և ակտիվ բաղադրիչների մատուցում', 9)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_hy = EXCLUDED.name_hy,
  description_en = EXCLUDED.description_en,
  description_ru = EXCLUDED.description_ru,
  description_hy = EXCLUDED.description_hy,
  display_order = EXCLUDED.display_order;

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
