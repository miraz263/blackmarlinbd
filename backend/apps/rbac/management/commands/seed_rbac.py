"""
Management command: seed the RBAC permission catalogue and 5 system roles.

Usage:
    python manage.py seed_rbac
    python manage.py seed_rbac --reset   # wipe and re-seed
"""
from django.core.management.base import BaseCommand
from apps.rbac.models import Permission, Role, MODULES, ACTIONS

ALL = set(ACTIONS)

# ─── Permission matrix ────────────────────────────────────────────────────
# Keys match Role.slug.  Value is {module: set_of_actions}.
# Modules not listed get no permissions for that role.
ROLE_MATRIX = {
    "superadmin": {m: ALL for m in MODULES},

    "hr-manager": {
        "users":         {"view", "create", "edit", "delete"},
        "jobs":          ALL,
        "blog":          {"view"},
        "projects":      {"view"},
        "services":      {"view"},
        "about":         {"view"},
        "media":         {"view"},
        "contacts":      {"view"},
    },

    "marketing-manager": {
        "users":         {"view"},
        "jobs":          {"view"},
        "blog":          {"view", "create", "edit", "publish"},
        "projects":      {"view"},
        "services":      {"view", "create", "edit", "publish"},
        "homepage":      {"view", "edit", "publish"},
        "about":         {"view", "create", "edit"},
        "seo":           {"view", "create", "edit"},
        "media":         {"view", "create"},
        "contacts":      {"view"},
        "site_settings": {"view"},
    },

    "content-editor": {
        "users":         {"view"},
        "jobs":          {"view"},
        "blog":          {"view", "create", "edit", "publish"},
        "projects":      {"view", "create", "edit"},
        "services":      {"view"},
        "homepage":      {"view"},
        "about":         {"view", "edit"},
        "seo":           {"view"},
        "media":         {"view", "create", "delete"},
        "contacts":      {"view"},
    },

    "project-manager": {
        "users":         {"view"},
        "jobs":          {"view"},
        "blog":          {"view"},
        "projects":      ALL,
        "services":      {"view", "create", "edit"},
        "homepage":      {"view"},
        "about":         {"view"},
        "seo":           {"view"},
        "media":         {"view", "create"},
        "contacts":      {"view"},
    },

    "blog-writer": {
        "blog":     {"view", "create", "edit"},
        "contacts": {"view"},
        "media":    {"view", "create"},
    },
}

ROLE_META = {
    "superadmin":        ("SuperAdmin",        "Full unrestricted access to everything."),
    "hr-manager":        ("HR Manager",        "Manages users and job postings."),
    "marketing-manager": ("Marketing Manager", "Manages blog, services, homepage, and SEO content."),
    "content-editor":    ("Content Editor",    "Creates and publishes blog posts, projects, and media."),
    "project-manager":   ("Project Manager",   "Owns projects and service pages."),
    "blog-writer":       ("Blog Writer",       "Writes and edits blog posts and can view the contact inbox."),
}


class Command(BaseCommand):
    help = "Seed RBAC permissions and system roles"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Delete all non-system roles/permissions then re-seed",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            Permission.objects.all().delete()
            Role.objects.all().delete()
            self.stdout.write("Wiped existing permissions and roles.")

        # ── 1. Seed permissions catalogue ──────────────────────────────
        created = 0
        for module in MODULES:
            for action in ACTIONS:
                codename = f"{module}.{action}"
                name     = f"{module.replace('_', ' ').title()}: {action.title()}"
                _, is_new = Permission.objects.get_or_create(
                    module=module, action=action,
                    defaults={"codename": codename, "name": name},
                )
                if is_new:
                    created += 1

        total_perms = len(MODULES) * len(ACTIONS)
        self.stdout.write(
            self.style.SUCCESS(f"Permissions: {created} created, {total_perms} total")
        )

        # ── 2. Seed roles ──────────────────────────────────────────────
        for slug, (name, description) in ROLE_META.items():
            role, _ = Role.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": description, "is_system": True},
            )
            # Always refresh permissions in case matrix changed
            perm_codenames = set()
            for module, actions in ROLE_MATRIX.get(slug, {}).items():
                for action in actions:
                    perm_codenames.add(f"{module}.{action}")

            perms = Permission.objects.filter(codename__in=perm_codenames)
            role.permissions.set(perms)
            self.stdout.write(f"  Role '{role.name}': {perms.count()} permissions")

        self.stdout.write(self.style.SUCCESS("RBAC seed complete."))
