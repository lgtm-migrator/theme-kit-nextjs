import type { UploadedImage } from '@prezly/sdk';
import { ASSETS_URL } from './constants';
import { getAssetsUrl } from './getAssetsUrl';

const uploadcareImage: UploadedImage = {
    version: 2,
    uuid: '43258238-9e71-49fa-a35e-dca5baf16a3b',
    filename: 'prezly-photographe.png',
    mime_type: 'image/png',
    size: 74234,
    original_width: 1162,
    original_height: 369,
    effects: ['/crop/369x369/0,0/', '/preview/'],
    // isImage: true,
    // download_url:
    //     'https://cdn.uc.assets.prezly.com/43258238-9e71-49fa-a35e-dca5baf16a3b/-/crop/369x369/0,0/-/preview/-/inline/no/prezly-photographe.png',
    // cdnUrl: 'https://cdn.uc.assets.prezly.com/43258238-9e71-49fa-a35e-dca5baf16a3b/-/crop/369x369/0,0/-/preview/',
};

describe('getAssetsUrl', () => {
    it('generates correct asset URL without effects', () => {
        const image = { ...uploadcareImage, effects: [] };
        expect(getAssetsUrl(image)).toBe(`${ASSETS_URL}/${image.uuid}/`);
    });

    it('generates correct asset URL with effects', () => {
        expect(getAssetsUrl(uploadcareImage)).toBe(
            `${ASSETS_URL}/${uploadcareImage.uuid}/-${uploadcareImage.effects[0]}-${uploadcareImage.effects[1]}`,
        );
    });

    it('generates correct asset URL with uuid passed to it', () => {
        expect(getAssetsUrl(uploadcareImage.uuid)).toBe(`${ASSETS_URL}/${uploadcareImage.uuid}/`);
    });
});
