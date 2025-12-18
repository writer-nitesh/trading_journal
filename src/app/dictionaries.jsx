const dictionaries = {
    en: () => import("./dictionaries/en.json").then((module) => module.default),
    ar: () => import("./dictionaries/hi.json").then((module) => module.default)
};