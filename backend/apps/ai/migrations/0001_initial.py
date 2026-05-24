import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AIGeneratedContent",
            fields=[
                ("id",            models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",    models.DateTimeField(auto_now_add=True)),
                ("updated_at",    models.DateTimeField(auto_now=True)),
                ("content_type",  models.CharField(choices=[("blog","Blog Post"),("seo","SEO Analysis"),("faq","FAQ"),("chat","Chat Response"),("lead","Lead Analysis")], db_index=True, max_length=20)),
                ("prompt",        models.TextField()),
                ("result",        models.JSONField()),
                ("provider",      models.CharField(max_length=50)),
                ("model",         models.CharField(blank=True, max_length=100)),
                ("tokens_input",  models.PositiveIntegerField(default=0)),
                ("tokens_output", models.PositiveIntegerField(default=0)),
                ("created_by",    models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="ai_generations", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "ai_generated_content", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="AISession",
            fields=[
                ("id",         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("context",    models.CharField(choices=[("general","General"),("sales","Sales"),("support","Support"),("technical","Technical")], default="general", max_length=20)),
                ("title",      models.CharField(blank=True, max_length=200)),
                ("user",       models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_sessions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "ai_sessions", "ordering": ["-updated_at"]},
        ),
        migrations.CreateModel(
            name="AIChatMessage",
            fields=[
                ("id",         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role",       models.CharField(choices=[("user","User"),("assistant","Assistant"),("system","System")], max_length=20)),
                ("content",    models.TextField()),
                ("tokens",     models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("session",    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="ai.aisession")),
            ],
            options={"db_table": "ai_chat_messages", "ordering": ["created_at"]},
        ),
        migrations.CreateModel(
            name="AIUsageLog",
            fields=[
                ("id",            models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("feature",       models.CharField(db_index=True, max_length=50)),
                ("provider",      models.CharField(max_length=50)),
                ("model",         models.CharField(blank=True, max_length=100)),
                ("tokens_input",  models.PositiveIntegerField(default=0)),
                ("tokens_output", models.PositiveIntegerField(default=0)),
                ("created_at",    models.DateTimeField(auto_now_add=True)),
                ("created_by",    models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "ai_usage_logs", "ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="aigeneratedcontent",
            index=models.Index(fields=["content_type", "created_at"], name="ai_gen_type_date_idx"),
        ),
        migrations.AddIndex(
            model_name="aigeneratedcontent",
            index=models.Index(fields=["created_by", "created_at"], name="ai_gen_user_date_idx"),
        ),
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["feature", "created_at"], name="ai_usage_feature_date_idx"),
        ),
    ]
