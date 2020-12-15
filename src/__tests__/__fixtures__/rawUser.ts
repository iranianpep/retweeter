import {Twitter} from 'twit';

export const getRawUser = (overrides?: Partial<Twitter.User>): Twitter.User => {
    const defaultUser: Twitter.User = {
        contributors_enabled: false,
        created_at: 'Mon Nov 29 21:18:15 +0000 2010',
        default_profile: '',
        default_profile_image: '',
        description: '',
        entities: {
            hashtags: [],
            media: [],
            urls: [],
            user_mentions: [],
            symbols: [],
            polls: []
        },
        favourites_count: 0,
        followers_count: 10,
        friends_count: 10,
        id: 123,
        id_str: '123',
        lang: 'fa',
        listed_count: 10,
        location: '',
        name: '',
        profile_background_color: '',
        profile_background_image_url: '',
        profile_background_image_url_https: '',
        profile_background_tile: false,
        profile_banner_url: '',
        profile_image_url: '',
        profile_image_url_https: '',
        profile_link_color: '',
        profile_sidebar_border_color: '',
        profile_sidebar_fill_color: '',
        profile_text_color: '',
        profile_use_background_image: false,
        protected: false,
        screen_name: '',
        show_all_inline_media: false,
        statuses_count: 1,
        url: '',
        verified: false,
        withheld_in_countries: '',
        withheld_scope: ''
    };

    return {...defaultUser, ...overrides};
};