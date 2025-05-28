const translate = require("translate-google");
const langdetect = require("langdetect");

const detectLanguage = async (text) => {
  const result = langdetect.detectOne(text);
  return result ? result : "Unknown Language";
};

const translateText = async (text) => {
  let detectedLanguage = await detectLanguage(text);
  let title_1, title_2;

  if (detectedLanguage === "ar") {
    // Translate from Arabic to English
    let res_data = await translate(text, { from: "ar", to: "en" });
    title_1 = res_data;
    title_2 = text;
  } else {
    // Translate from English to Arabic
    let res_data = await translate(text, { from: "en", to: "ar" });
    title_1 = text;
    title_2 = res_data;
  }

  return { title_1, title_2 };
};
