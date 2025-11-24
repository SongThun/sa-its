"""
Django management command for database seeding.

Usage:
    python manage.py seed                    # Seed all fixtures
    python manage.py seed --file users.json  # Seed specific file
    python manage.py seed --clear users      # Clear table before seeding
"""

from django.core.management.base import BaseCommand
from data.seed import seed_all, seed_from_file, clear_table
from pathlib import Path


class Command(BaseCommand):
    help = "Seed the database with fixture data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            type=str,
            help="Clear a specific table before seeding",
            metavar="TABLE",
        )
        parser.add_argument(
            "--file",
            type=str,
            help="Seed from a specific fixture file (relative to fixtures dir)",
            metavar="FILE",
        )
        parser.add_argument(
            "--dir",
            type=str,
            help="Fixtures directory path",
            metavar="DIR",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write(f"Clearing table: {options['clear']}")
            clear_table(options["clear"])

        if options["file"]:
            # Resolve file path relative to fixtures directory
            fixtures_dir = (
                Path(__file__).resolve().parent.parent.parent.parent.parent
                / "data"
                / "fixtures"
            )
            filepath = fixtures_dir / options["file"]

            if not filepath.exists():
                self.stderr.write(self.style.ERROR(f"File not found: {filepath}"))
                return

            seed_from_file(filepath)
        else:
            seed_all(options.get("dir"))

        self.stdout.write(self.style.SUCCESS("Seeding completed!"))
