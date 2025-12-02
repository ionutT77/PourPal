from .models import Hangout

# Mapping between user hobbies and hangout categories
HOBBY_CATEGORY_MAP = {
    # Gaming
    'Gaming': 'gaming',
    'Board Games': 'gaming',
    
    # Sports & Fitness
    'Sports': 'sports',
    'Fitness': 'sports',
    'Yoga': 'sports',
    'Cycling': 'sports',
    'Swimming': 'sports',
    
    # Outdoor
    'Hiking': 'outdoor',
    'Gardening': 'outdoor',
    'Fishing': 'outdoor',
    'Camping': 'outdoor',
    'Traveling': 'outdoor',
    
    # Music
    'Music': 'music',
    'Dancing': 'music',
    
    # Arts & Culture
    'Painting': 'arts',
    'Writing': 'arts',
    'Crafts': 'arts',
    'Photography': 'arts',
    'Theater': 'arts',
    'Movies': 'arts',
    'Reading': 'arts',
    
    # Food & Dining
    'Cooking': 'food',
}

def get_user_category_preferences(user):
    """
    Returns a list of hangout categories based on user's hobbies.
    """
    if not hasattr(user, 'profile'):
        return []
        
    hobbies = user.profile.hobbies
    categories = set()
    
    for hobby in hobbies:
        if hobby in HOBBY_CATEGORY_MAP:
            categories.add(HOBBY_CATEGORY_MAP[hobby])
            
    # If user has 'food' related hobbies, they might also like 'drinks'
    if 'food' in categories:
        categories.add('drinks')
        
    return list(categories)
