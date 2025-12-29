const DEEPL_API_KEY = "6e692031-9d67-4f57-bfb1-d83b75c75604:fx"
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

export interface TranslationResponse {
  translations: Array<{
    detected_source_language: string
    text: string
  }>
}

export async function translateText(text: string, targetLang = "RU"): Promise<string> {
  try {
    const response = await fetch(DEEPL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: text,
        target_lang: targetLang,
        source_lang: "EN",
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`)
    }

    const data: TranslationResponse = await response.json()
    return data.translations[0]?.text || text
  } catch (error) {
    console.error("Translation error:", error)
    return text // Fallback to original text
  }
}

// Pre-translated content for better performance
export const translations = {
  en: {
    // Hero section
    "Clear Skin Starts Here!": "Clear Skin Starts Here!",
    "Discover our premium bakuchiol serum that targets blemishes and improves skin texture for a clearer, more radiant complexion.":
      "Discover our premium bakuchiol serum that targets blemishes and improves skin texture for a clearer, more radiant complexion.",
    "Repair & Hydrate!": "Repair & Hydrate!",
    "Experience the power of snail mucin with our bestselling essence that repairs damaged skin and provides deep hydration.":
      "Experience the power of snail mucin with our bestselling essence that repairs damaged skin and provides deep hydration.",
    "Transform Your Skin!": "Transform Your Skin!",
    "Reveal smoother, brighter skin with our professional-strength exfoliating treatment for weekly use.":
      "Reveal smoother, brighter skin with our professional-strength exfoliating treatment for weekly use.",
    "Perfect Your Pout!": "Perfect Your Pout!",
    "Nourish and tint your lips with our peptide-infused lip treatment that adapts to your natural pH.":
      "Nourish and tint your lips with our peptide-infused lip treatment that adapts to your natural pH.",

    // Buttons and navigation
    "DISCOVER YOUR ROUTINE": "DISCOVER YOUR ROUTINE",
    "Shop by Category": "Shop by Category",
    "FACE CARE": "FACE CARE",
    ABOUT: "ABOUT",
    "ROUTINE FINDER": "ROUTINE FINDER",

    // Categories
    "Face Care": "Face Care",
    "Cleansers, serums & moisturizers": "Cleansers, serums & moisturizers",
    "Routine Finder": "Routine Finder",
    "Personalized skincare routine": "Personalized skincare routine",
  },
  ru: {
    // Hero section
    "Clear Skin Starts Here!": "Чистая кожа начинается здесь!",
    "Discover our premium bakuchiol serum that targets blemishes and improves skin texture for a clearer, more radiant complexion.":
      "Откройте для себя нашу премиальную сыворотку с бакучиолом, которая борется с несовершенствами и улучшает текстуру кожи для более чистого и сияющего цвета лица.",
    "Repair & Hydrate!": "Восстановление и увлажнение!",
    "Experience the power of snail mucin with our bestselling essence that repairs damaged skin and provides deep hydration.":
      "Ощутите силу улиточного муцина с нашей бестселлерной эссенцией, которая восстанавливает поврежденную кожу и обеспечивает глубокое увлажнение.",
    "Transform Your Skin!": "Преобразите свою кожу!",
    "Reveal smoother, brighter skin with our professional-strength exfoliating treatment for weekly use.":
      "Откройте более гладкую и сияющую кожу с нашим профессиональным отшелушивающим средством для еженедельного использования.",
    "Perfect Your Pout!": "Совершенствуйте свои губы!",
    "Nourish and tint your lips with our peptide-infused lip treatment that adapts to your natural pH.":
      "Питайте и тонируйте губы нашим средством с пептидами, которое адаптируется к вашему естественному pH.",

    // Buttons and navigation
    "DISCOVER YOUR ROUTINE": "НАЙТИ СВОЙ УХОД",
    "Shop by Category": "Покупки по категориям",
    "FACE CARE": "УХОД ЗА ЛИЦОМ",
    ABOUT: "О НАС",
    "ROUTINE FINDER": "ПОДБОР УХОДА",

    // Categories
    "Face Care": "Уход за лицом",
    "Cleansers, serums & moisturizers": "Очищающие средства, сыворотки и увлажняющие кремы",
    "Routine Finder": "Подбор ухода",
    "Personalized skincare routine": "Персонализированный уход за кожей",
  },
}
