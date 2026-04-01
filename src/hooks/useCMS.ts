import cmsData from '../cms_content.json';

type CmsData = any;

/**
 * A hook to safely retrieve CMS string/content from the statically compiled cms_content.json file.
 * Returns the provided fallback if the key doesn't exist.
 */
export const useCms = (keyPath: string, fallback: string): string => {
    try {
        const keys = keyPath.split('.');
        let current: CmsData = cmsData;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return fallback;
            }
        }

        if (typeof current === 'string' || typeof current === 'number') {
            return String(current);
        }
        
        return fallback;
    } catch (e) {
        console.warn(`CMS Fetch Error for ${keyPath}`);
        return fallback;
    }
};
