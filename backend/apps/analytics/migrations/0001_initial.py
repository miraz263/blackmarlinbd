from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="PageView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("path",        models.CharField(max_length=500, db_index=True)),
                ("session_key", models.CharField(max_length=64, db_index=True)),
                ("ip_hash",     models.CharField(max_length=64, blank=True)),
                ("device_type", models.CharField(
                    max_length=10,
                    choices=[("desktop", "Desktop"), ("mobile", "Mobile"), ("tablet", "Tablet")],
                    default="desktop",
                )),
                ("referrer",   models.CharField(max_length=500, blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={"db_table": "analytics_page_views"},
        ),
        migrations.CreateModel(
            name="DailySummary",
            fields=[
                ("id",              models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date",            models.DateField(unique=True, db_index=True)),
                ("page_views",      models.PositiveIntegerField(default=0)),
                ("unique_visitors", models.PositiveIntegerField(default=0)),
                ("new_contacts",    models.PositiveIntegerField(default=0)),
                ("job_applications", models.PositiveIntegerField(default=0)),
                ("blog_views",      models.PositiveIntegerField(default=0)),
                ("desktop_views",   models.PositiveIntegerField(default=0)),
                ("mobile_views",    models.PositiveIntegerField(default=0)),
                ("tablet_views",    models.PositiveIntegerField(default=0)),
            ],
            options={"db_table": "analytics_daily_summaries", "ordering": ["-date"]},
        ),
        migrations.AddIndex(
            model_name="pageview",
            index=models.Index(fields=["created_at", "path"], name="analytics_pv_date_path_idx"),
        ),
        migrations.AddIndex(
            model_name="pageview",
            index=models.Index(fields=["session_key", "created_at"], name="analytics_pv_sess_date_idx"),
        ),
        migrations.AddIndex(
            model_name="pageview",
            index=models.Index(fields=["device_type", "created_at"], name="analytics_pv_dev_date_idx"),
        ),
    ]
