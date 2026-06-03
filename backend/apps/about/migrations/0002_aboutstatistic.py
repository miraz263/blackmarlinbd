from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("about", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="AboutStatistic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("icon_name", models.CharField(default="Code2", help_text="Lucide icon name (PascalCase), e.g. Code2, Globe2, Users, Award", max_length=50)),
                ("value", models.CharField(help_text='Display value, e.g. "1M+" or "120+"', max_length=50)),
                ("label", models.CharField(help_text='Label below the value, e.g. "Lines of Production Code"', max_length=100)),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Statistic",
                "verbose_name_plural": "Statistics",
                "db_table": "about_statistics",
                "ordering": ["order"],
            },
        ),
    ]
