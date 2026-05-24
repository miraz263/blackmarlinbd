import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
        ("rbac", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ApprovalWorkflow",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=200)),
                ("app_label", models.CharField(max_length=100)),
                ("model_name", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("auto_publish", models.BooleanField(default=False, help_text="Automatically publish content when the final approval step is reached")),
            ],
            options={
                "db_table": "workflow_approval_workflows",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="WorkflowStep",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=200)),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("instructions", models.TextField(blank=True)),
                ("workflow", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="steps", to="workflow.approvalworkflow")),
                ("required_role", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="workflow_steps", to="rbac.role")),
            ],
            options={
                "db_table": "workflow_steps",
                "ordering": ["order"],
            },
        ),
        migrations.CreateModel(
            name="ContentReview",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("object_id", models.PositiveIntegerField()),
                ("status", models.CharField(choices=[("draft", "Draft"), ("review", "In Review"), ("approved", "Approved"), ("published", "Published"), ("archived", "Archived")], db_index=True, default="draft", max_length=20)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("content_title", models.CharField(blank=True, max_length=500)),
                ("content_type", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="contenttypes.contenttype")),
                ("current_step", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="active_reviews", to="workflow.workflowstep")),
                ("workflow", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="reviews", to="workflow.approvalworkflow")),
                ("submitted_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="submitted_reviews", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "workflow_content_reviews",
            },
        ),
        migrations.CreateModel(
            name="WorkflowTransition",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("from_status", models.CharField(choices=[("draft", "Draft"), ("review", "In Review"), ("approved", "Approved"), ("published", "Published"), ("archived", "Archived")], max_length=20)),
                ("to_status", models.CharField(choices=[("draft", "Draft"), ("review", "In Review"), ("approved", "Approved"), ("published", "Published"), ("archived", "Archived")], max_length=20)),
                ("comment", models.TextField(blank=True)),
                ("actor", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="workflow_transitions", to=settings.AUTH_USER_MODEL)),
                ("review", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transitions", to="workflow.contentreview")),
            ],
            options={
                "db_table": "workflow_transitions",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="WorkflowNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("message", models.CharField(max_length=500)),
                ("notification_type", models.CharField(max_length=30)),
                ("is_read", models.BooleanField(db_index=True, default=False)),
                ("review", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="workflow.contentreview")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="workflow_notifications", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "workflow_notifications",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="contentreview",
            constraint=models.UniqueConstraint(fields=["content_type", "object_id"], name="unique_content_review"),
        ),
        migrations.AddIndex(
            model_name="contentreview",
            index=models.Index(fields=["status", "created_at"], name="workflow_cr_status_created_idx"),
        ),
        migrations.AddIndex(
            model_name="workflownotification",
            index=models.Index(fields=["user", "is_read", "created_at"], name="workflow_notif_user_read_idx"),
        ),
        migrations.AlterUniqueTogether(
            name="approvalworkflow",
            unique_together={("app_label", "model_name")},
        ),
    ]
