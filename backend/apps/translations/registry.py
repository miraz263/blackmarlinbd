"""
Central registry of which model fields are translatable.
Format: "app_label.ModelName_lower": [list_of_field_names]

The source-of-truth (English) lives in the model's own columns.
Translations for other languages live in ContentTranslation.
"""

TRANSLATABLE_MODELS: dict[str, list[str]] = {
    "blog.blogpost":      ["title", "excerpt", "content"],
    "services.servicecategory": ["name", "description"],
    "services.service":   ["title", "tagline", "short_description", "description", "body"],
    "projects.project":   ["title", "short_description", "description"],
    "page_builder.page":  ["title", "description"],
    "jobs.job":           ["title", "description", "requirements"],
    "about.aboutpage":    ["badge_text", "hero_title", "hero_subtitle", "hero_description", "tagline"],
    "about.mission":      ["title", "description"],
    "about.vision":       ["title", "description"],
    "about.corevalue":    ["title", "description"],
    "about.aboutstatistic": ["label"],
    "homepage.herosection": ["title", "subtitle", "description", "badge_text"],
    "homepage.homepagesection": ["title", "subtitle", "description", "badge_text", "cta_text"],
    "homepage.serviceitem": ["title", "description"],
    "products.productcategory": ["name"],
    "products.product": ["name", "tagline", "description"],
}

# Fields that are long-form (textarea vs single-line input)
LONG_FIELDS: frozenset[str] = frozenset(
    ["content", "description", "excerpt", "requirements", "mission", "subtitle", "hero_subtitle"]
)


def get_translatable_field_names(app_label: str, model_name: str) -> list[str]:
    key = f"{app_label}.{model_name.lower()}"
    return TRANSLATABLE_MODELS.get(key, [])


def is_long_field(field_name: str) -> bool:
    return field_name in LONG_FIELDS
