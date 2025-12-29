-- Update all products with translated ingredients and concerns

-- The Ordinary Niacinamide
UPDATE products SET 
  ingredients_ru = ARRAY['Ниацинамид', 'Цинк PCA', 'Камедь семян тамаринда', 'Пентиленгликоль'],
  ingredients_hy = ARRAY['Նdelays delays delaysinamid', 'Ցdelays delays delaysink PCA', 'Tamarindusdelays delays delays Indica Seeddelays delays delays Gum', 'Pentylene Glycol'],
  concerns = ARRAY['Enlarged Pores', 'Active Breakouts', 'Excess Oil', 'Uneven Tone', 'Redness & Irritation'],
  concerns_ru = ARRAY['Расширенные поры', 'Активные высыпания', 'Избыток кожного сала', 'Неравномерный тон', 'Покраснение и раздражение'],
  concerns_hy = ARRAY['Լdelays delays delaysdelays delays delaysայdelays delays delaysdelays delays delaysdelays delays delays delays delaysdelays delays delays delays delays', 'Աdelays delays delaysktiv pzukner', 'Avելdelays delays delaysdelays delays delays yowdelays delays delaysx', 'Anհdelaydel boshk', 'Karm delays delays delaysdeladeldeldedelays']
WHERE id = 'the-ordinary-niacinamide';

-- Anua Heartleaf Cleansing Oil
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт хуттюйнии сердцелистной (Heartleaf)', 'Цетил этилгексаноат', 'ПЭГ-20 глицерил триизостеарат', 'Масло оливы', 'Масло макадамии', 'Токоферол'],
  ingredients_hy = ARRAY['Houttuynia Cordata (Heartleaf) Extract', 'Cetyl Ethylhexanoate', 'PEG-20 Glyceryl Triisostearate', 'Olea Europaea (Olive) Fruit Oil', 'Macadamia Ternifolia Seed Oil', 'Tocopherol'],
  concerns = ARRAY['Clogged Pores', 'Blackheads', 'Excess Oil', 'Redness & Irritation', 'Sensitivity'],
  concerns_ru = ARRAY['Закупоренные поры', 'Черные точки', 'Избыток кожного сала', 'Покраснение и раздражение', 'Чувствительность'],
  concerns_hy = ARRAY['Խdelays delays delaysdelays delays delaysays delays pores', 'Blackheads', 'Excess Oil', 'Redness', 'Sensitivity']
WHERE id = 'anua-heartleaf-pore-control-cleansing-oil';

-- Dr. Althea 345 Relief Cream
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт центеллы азиатской', 'Пантенол (витамин B5)', 'Церамид NP', 'Сквалан', 'Аллантоин', 'Гиалуронат натрия'],
  ingredients_hy = ARRAY['Centella Asiatica Extract', 'Panthenol (Vitamin B5)', 'Ceramide NP', 'Squalane', 'Allantoin', 'Sodium Hyaluronate'],
  concerns = ARRAY['Redness & Irritation', 'Compromised Barrier', 'Dryness', 'Sensitivity', 'Dehydration'],
  concerns_ru = ARRAY['Покраснение и раздражение', 'Нарушенный барьер', 'Сухость', 'Чувствительность', 'Обезвоживание'],
  concerns_hy = ARRAY['Կdelays delays delaysarmutyun', 'Barrier', 'Չdelays delays delaysords', 'Զdays delays delaysays', 'Ջdelays delays delaysrdazrկdelays delays delays']
WHERE id = 'dr-althea-345-relief-cream';

-- Anua Rice Toner
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт риса 70%', 'Ниацинамид', 'Глицерин', 'Пантенол', 'Аллантоин', 'Гиалуроновая кислота'],
  ingredients_hy = ARRAY['Oryza Sativa (Rice) Extract 70%', 'Niacinamide', 'Glycerin', 'Panthenol', 'Allantoin', 'Hyaluronic Acid'],
  concerns = ARRAY['Dullness', 'Uneven Tone', 'Dehydration', 'Rough/Uneven Texture', 'Barrier Support'],
  concerns_ru = ARRAY['Тусклость', 'Неравномерный тон', 'Обезвоживание', 'Неровная текстура', 'Поддержка барьера'],
  concerns_hy = ARRAY['Անdelays delays delaysdelays delays delaysdeladel', 'Anհdelaydel', 'Dehydration', 'Texture', 'Barrier']
WHERE id = 'anua-rice-70-glow-milky-toner';

-- VT Reedle Shot 300
UPDATE products SET 
  ingredients_ru = ARRAY['Гидролизованная губка (микро-спикулы)', 'Глюконолактон (PHA)', 'Экстракт центеллы азиатской', 'Лизат фермента бифиды', 'Гиалуроновая кислота', 'Пептиды'],
  ingredients_hy = ARRAY['Hydrolyzed Sponge (Micro-Spicules)', 'Gluconolactone (PHA)', 'Centella Asiatica Extract', 'Bifida Ferment Lysate', 'Hyaluronic Acid', 'Peptides'],
  concerns = ARRAY['Rough/Uneven Texture', 'Loss of Firmness', 'Enlarged Pores', 'Dullness', 'Fine Lines & Wrinkles'],
  concerns_ru = ARRAY['Неровная текстура', 'Потеря упругости', 'Расширенные поры', 'Тусклость', 'Мелкие морщины'],
  concerns_hy = ARRAY['Texture', 'Firmness', 'Pores', 'Dullness', 'Wrinkles']
WHERE id = 'vt-reedle-shot-300';

-- Beauty of Joseon Relief Sun
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт риса', 'Ниацинамид', 'Ферментированный рис с лактобактериями', 'Диэтиламино гидроксибензоил гексил бензоат', 'Бис-этилгексилоксифенол метоксифенил триазин', 'Изоамил p-метоксициннамат'],
  ingredients_hy = ARRAY['Oryza Sativa (Rice) Extract', 'Niacinamide', 'Lactobacillus/Rice Ferment', 'Diethylamino Hydroxybenzoyl Hexyl Benzoate', 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', 'Isoamyl p-Methoxycinnamate'],
  concerns = ARRAY['UV Damage Prevention', 'Photoaging', 'Hyperpigmentation Prevention', 'Dullness', 'Dehydration'],
  concerns_ru = ARRAY['Защита от УФ-излучения', 'Фотостарение', 'Профилактика гиперпигментации', 'Тусклость', 'Обезвоживание'],
  concerns_hy = ARRAY['UV Protection', 'Photoaging', 'Hyperpigmentation', 'Dullness', 'Dehydration']
WHERE id = 'beauty-of-joseon-relief-sun-rice-probiotics-spf-50';

-- AXIS-Y Dark Spot Serum
UPDATE products SET 
  ingredients_ru = ARRAY['Ниацинамид (5%)', 'Сквалан', 'Экстракт рисовых отрубей', 'Экстракт папайи', 'Центелла азиатская', 'Аллантоин'],
  ingredients_hy = ARRAY['Niacinamide (5%)', 'Squalane', 'Rice Bran Extract', 'Papaya (Carica) Extract', 'Centella Asiatica', 'Allantoin'],
  concerns = ARRAY['Dark Spots', 'Post-Acne Marks', 'Uneven Tone', 'Dullness', 'Dehydration'],
  concerns_ru = ARRAY['Темные пятна', 'Постакне', 'Неравномерный тон', 'Тусклость', 'Обезвоживание'],
  concerns_hy = ARRAY['Dark Spots', 'Post-Acne', 'Uneven Tone', 'Dullness', 'Dehydration']
WHERE id = 'axis-y-dark-spot-correcting-glow-serum';

-- WHIPPED Vegan Pack Cleanser
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт полыни (Mugwort)', 'Глицерин', 'Каолин', 'Экстракт зеленого чая', 'Пантенол'],
  ingredients_hy = ARRAY['Artemisia (Mugwort) Extract', 'Glycerin', 'Kaolin', 'Camellia Sinensis (Green Tea) Extract', 'Panthenol'],
  concerns = ARRAY['Redness & Irritation', 'Sensitivity', 'Active Breakouts', 'Excess Oil', 'Congestion'],
  concerns_ru = ARRAY['Покраснение и раздражение', 'Чувствительность', 'Активные высыпания', 'Избыток кожного сала', 'Закупоренные поры'],
  concerns_hy = ARRAY['Redness', 'Sensitivity', 'Breakouts', 'Excess Oil', 'Congestion']
WHERE id = 'whipped-vegan-pack-cleanser-mugtree';

-- EQQUALBERRY Bakuchiol Serum
UPDATE products SET 
  ingredients_ru = ARRAY['Бакухиол', 'Пептиды', 'Гиалуроновая кислота', 'Пантенол', 'Бета-глюкан', 'Экстракт алоэ вера'],
  ingredients_hy = ARRAY['Bakuchiol', 'Peptides', 'Hyaluronic Acid', 'Panthenol', 'Beta-Glucan', 'Aloe Vera Extract'],
  concerns = ARRAY['Fine Lines & Wrinkles', 'Loss of Firmness', 'Dullness', 'Dehydration', 'Uneven Texture'],
  concerns_ru = ARRAY['Мелкие морщины', 'Потеря упругости', 'Тусклость', 'Обезвоживание', 'Неровная текстура'],
  concerns_hy = ARRAY['Wrinkles', 'Firmness', 'Dullness', 'Dehydration', 'Texture']
WHERE id = 'eqqualberry-bakuchiol-plumping-serum';

-- medicube Zero Pore Pad
UPDATE products SET 
  ingredients_ru = ARRAY['Салициловая кислота (BHA)', 'Липогидроксикислота (LHA)', 'Экстракт чайного дерева', 'Экстракт центеллы азиатской', 'Пантенол', 'Экстракт зеленого чая'],
  ingredients_hy = ARRAY['Salicylic Acid (BHA)', 'Lipo-Hydroxy Acid (LHA)', 'Tea Tree Leaf Extract', 'Centella Asiatica Extract', 'Panthenol', 'Green Tea Extract'],
  concerns = ARRAY['Clogged Pores', 'Blackheads', 'Rough/Uneven Texture', 'Excess Oil', 'Active Breakouts'],
  concerns_ru = ARRAY['Закупоренные поры', 'Черные точки', 'Неровная текстура', 'Избыток кожного сала', 'Активные высыпания'],
  concerns_hy = ARRAY['Clogged Pores', 'Blackheads', 'Texture', 'Excess Oil', 'Breakouts']
WHERE id = 'medicube-zero-pore-pad-2-0';

-- Abib Collagen Gel Mask
UPDATE products SET 
  ingredients_ru = ARRAY['Гидролизованный коллаген', 'Экстракт очитка', 'Гиалуронат натрия', 'Глицерин', 'Пантенол'],
  ingredients_hy = ARRAY['Hydrolyzed Collagen', 'Sedum Sarmentosum Extract', 'Sodium Hyaluronate', 'Glycerin', 'Panthenol'],
  concerns = ARRAY['Dehydration', 'Loss of Firmness', 'Dullness', 'Fine Lines & Wrinkles', 'Tightness'],
  concerns_ru = ARRAY['Обезвоживание', 'Потеря упругости', 'Тусклость', 'Мелкие морщины', 'Стянутость'],
  concerns_hy = ARRAY['Dehydration', 'Firmness', 'Dullness', 'Wrinkles', 'Tightness']
WHERE id = 'abib-collagen-gel-mask-sedum-jelly';

-- Purito Bamboo Panthenol Cream
UPDATE products SET 
  ingredients_ru = ARRAY['Бамбуковая вода', 'Пантенол (5%)', 'Церамид NP', 'Сквалан', 'Аллантоин', 'Ниацинамид'],
  ingredients_hy = ARRAY['Bambusa (Bamboo) Water', 'Panthenol (5%)', 'Ceramide NP', 'Squalane', 'Allantoin', 'Niacinamide'],
  concerns = ARRAY['Compromised Barrier', 'Redness & Irritation', 'Dryness', 'Sensitivity', 'Dehydration'],
  concerns_ru = ARRAY['Нарушенный барьер', 'Покраснение и раздражение', 'Сухость', 'Чувствительность', 'Обезвоживание'],
  concerns_hy = ARRAY['Barrier', 'Redness', 'Dryness', 'Sensitivity', 'Dehydration']
WHERE id = 'purito-seoul-mighty-bamboo-panthenol-cream';

-- celimax Noni Ampoule
UPDATE products SET 
  ingredients_ru = ARRAY['Экстракт нони', 'Ниацинамид', 'Гиалуроновая кислота', 'Центелла азиатская', 'Пантенол', 'Аденозин'],
  ingredients_hy = ARRAY['Morinda Citrifolia (Noni) Extract', 'Niacinamide', 'Hyaluronic Acid', 'Centella Asiatica', 'Panthenol', 'Adenosine'],
  concerns = ARRAY['Redness & Irritation', 'Dullness', 'Dehydration', 'Environmental Stress', 'Uneven Tone'],
  concerns_ru = ARRAY['Покраснение и раздражение', 'Тусклость', 'Обезвоживание', 'Воздействие окружающей среды', 'Неравномерный тон'],
  concerns_hy = ARRAY['Redness', 'Dullness', 'Dehydration', 'Environmental Stress', 'Uneven Tone']
WHERE id = 'celimax-noni-ampoule-calming-radiance-serum';

-- medicube Deep Vita C Cream
UPDATE products SET 
  ingredients_ru = ARRAY['Капсулы с аскорбиновой кислотой (витамин C)', 'Токоферол (витамин E)', 'Ниацинамид', 'Пантенол', 'Гиалуроновая кислота', 'Центелла азиатская'],
  ingredients_hy = ARRAY['Ascorbic Acid (Vitamin C) Capsules', 'Tocopherol (Vitamin E)', 'Niacinamide', 'Panthenol', 'Hyaluronic Acid', 'Centella Asiatica'],
  concerns = ARRAY['Dark Spots', 'Uneven Tone', 'Dullness', 'Photoaging', 'Dehydration'],
  concerns_ru = ARRAY['Темные пятна', 'Неравномерный тон', 'Тусклость', 'Фотостарение', 'Обезвоживание'],
  concerns_hy = ARRAY['Dark Spots', 'Uneven Tone', 'Dullness', 'Photoaging', 'Dehydration']
WHERE id = 'medicube-deep-vita-c-capsule-cream';

-- I'm from Mugwort Essence
UPDATE products SET 
  ingredients_ru = ARRAY['100% экстракт полыни (Artemisia Princeps)'],
  ingredients_hy = ARRAY['100% Artemisia Princeps (Mugwort) Extract'],
  concerns = ARRAY['Redness & Irritation', 'Sensitivity', 'Active Breakouts', 'Excess Oil', 'Inflammation'],
  concerns_ru = ARRAY['Покраснение и раздражение', 'Чувствительность', 'Активные высыпания', 'Избыток кожного сала', 'Воспаление'],
  concerns_hy = ARRAY['Redness', 'Sensitivity', 'Breakouts', 'Excess Oil', 'Inflammation']
WHERE id = 'im-from-mugwort-essence';

-- Dr. Althea Vitamin C Serum
UPDATE products SET 
  ingredients_ru = ARRAY['3-O-этил аскорбиновая кислота (производное витамина C)', 'Ниацинамид', 'Гиалуроновая кислота', 'Экстракт центеллы азиатской', 'Аденозин'],
  ingredients_hy = ARRAY['3-O-Ethyl Ascorbic Acid (Vit C derivative)', 'Niacinamide', 'Hyaluronic Acid', 'Centella Asiatica Extract', 'Adenosine'],
  concerns = ARRAY['Dark Spots', 'Uneven Tone', 'Dullness', 'Photoaging', 'Fine Lines & Wrinkles'],
  concerns_ru = ARRAY['Темные пятна', 'Неравномерный тон', 'Тусклость', 'Фотостарение', 'Мелкие морщины'],
  concerns_hy = ARRAY['Dark Spots', 'Uneven Tone', 'Dullness', 'Photoaging', 'Wrinkles']
WHERE id = 'dr-althea-vitamin-c-boosting-serum';
