from django.contrib import admin
from .models import Page, Section, Block


class BlockInline(admin.TabularInline):
    model   = Block
    extra   = 0
    fields  = ["block_type", "order", "is_published"]
    ordering = ["order"]


class SectionInline(admin.TabularInline):
    model   = Section
    extra   = 0
    fields  = ["label", "order", "is_published"]
    ordering = ["order"]
    show_change_link = True


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display  = ["title", "slug", "is_published", "section_count", "created_at"]
    list_filter   = ["is_published"]
    search_fields = ["title", "slug"]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["created_at", "updated_at"]
    inlines = [SectionInline]

    def section_count(self, obj):
        return obj.sections.count()
    section_count.short_description = "Sections"


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display  = ["__str__", "order", "is_published", "block_count"]
    list_filter   = ["is_published", "page"]
    search_fields = ["label", "page__title"]
    inlines = [BlockInline]

    def block_count(self, obj):
        return obj.blocks.count()
    block_count.short_description = "Blocks"


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display  = ["__str__", "block_type", "order", "is_published"]
    list_filter   = ["block_type", "is_published"]
    search_fields = ["section__page__title", "block_type"]
    readonly_fields = ["created_at", "updated_at"]
