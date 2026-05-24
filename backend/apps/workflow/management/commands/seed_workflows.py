from django.core.management.base import BaseCommand

from apps.workflow.models import ApprovalWorkflow, WorkflowStep

WORKFLOWS = [
    {
        "name": "Blog Post Workflow",
        "app_label": "blog",
        "model_name": "blogpost",
        "description": "Standard approval chain for blog posts",
        "auto_publish": False,
        "steps": [
            {
                "name": "Content Review",
                "order": 1,
                "role_slug": "content-editor",
                "instructions": "Review content quality, grammar, factual accuracy, and formatting.",
            },
            {
                "name": "Marketing Approval",
                "order": 2,
                "role_slug": "marketing-manager",
                "instructions": "Approve for brand alignment, publishing schedule, and SEO.",
            },
        ],
    },
    {
        "name": "Service Page Workflow",
        "app_label": "services",
        "model_name": "service",
        "description": "Approval chain for service pages",
        "auto_publish": False,
        "steps": [
            {
                "name": "Manager Review",
                "order": 1,
                "role_slug": "marketing-manager",
                "instructions": "Review service description, pricing, and brand alignment.",
            },
        ],
    },
    {
        "name": "Page Builder Workflow",
        "app_label": "page_builder",
        "model_name": "page",
        "description": "Approval chain for custom pages built with the page builder",
        "auto_publish": False,
        "steps": [
            {
                "name": "Content Review",
                "order": 1,
                "role_slug": "content-editor",
                "instructions": "Review page content, structure, and section ordering.",
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed default approval workflows for blog, services, and page_builder"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing workflows before seeding",
        )

    def handle(self, *args, **options):
        from apps.rbac.models import Role

        if options["reset"]:
            ApprovalWorkflow.objects.all().delete()
            self.stdout.write("Cleared all existing workflows.")

        for wf_data in WORKFLOWS:
            steps = wf_data.pop("steps")
            wf, created = ApprovalWorkflow.objects.update_or_create(
                app_label=wf_data["app_label"],
                model_name=wf_data["model_name"],
                defaults=wf_data,
            )
            self.stdout.write(
                f"{'Created' if created else 'Updated'} workflow: {wf.name}"
            )

            wf.steps.all().delete()
            for step_data in steps:
                role_slug = step_data.pop("role_slug", None)
                role = None
                if role_slug:
                    role = Role.objects.filter(slug=role_slug).first()
                    if not role:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  Role '{role_slug}' not found — step '{step_data['name']}' has no role."
                            )
                        )
                WorkflowStep.objects.create(workflow=wf, required_role=role, **step_data)
                self.stdout.write(f"  Step {step_data['order']}: {step_data['name']}")

            # Restore the popped data for next iteration
            wf_data["steps"] = steps  # not needed but safe

        self.stdout.write(self.style.SUCCESS("Workflows seeded. Run seed_rbac first if roles are missing."))
