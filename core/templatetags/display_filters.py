from django import template
from ..models import FIELD_DISPLAY_MAPPINGS

register = template.Library()

@register.filter
def get_display_value(value, field_name):
    """Template filter to get display value for a field"""
    if field_name in FIELD_DISPLAY_MAPPINGS:
        return FIELD_DISPLAY_MAPPINGS[field_name].get(value, value)
    return value

@register.filter
def title_if_no_mapping(value, field_name):
    """Template filter to title case if no mapping exists"""
    if field_name in FIELD_DISPLAY_MAPPINGS:
        return FIELD_DISPLAY_MAPPINGS[field_name].get(value, value)
    return str(value).replace('_', ' ').title() if value else 'N/A'
