import type { Story } from '@prezly/sdk';
import type {
    GetServerSidePropsContext,
    GetServerSidePropsResult,
    GetStaticPropsContext,
    GetStaticPropsResult,
} from 'next';

import type { PaginationProps } from '../../infinite-loading/types';
import { DEFAULT_PAGE_SIZE } from '../../utils';
import { getNewsroomServerSideProps } from '../getNewsroomServerSideProps';
import { getNewsroomStaticProps } from '../getNewsroomStaticProps';
import { processRequest } from '../processRequest';
import { processStaticRequest } from '../processStaticRequest';

import type { PropsFunction } from './lib/types';

export interface HomePageProps<StoryType extends Story = Story> {
    stories: StoryType[];
    pagination: PaginationProps;
}

interface Options {
    extraStoryFields?: (keyof Story.ExtraFields)[];
    pageSize?: number;
}

export function getHomepageServerSideProps<
    CustomProps extends Record<string, any>,
    StoryType extends Story = Story,
>(customProps: CustomProps | PropsFunction<CustomProps>, options?: Options) {
    const { pageSize = DEFAULT_PAGE_SIZE, extraStoryFields } = options || {};

    return async function getServerSideProps(
        context: GetServerSidePropsContext,
    ): Promise<GetServerSidePropsResult<HomePageProps<StoryType> & CustomProps>> {
        const { api, serverSideProps } = await getNewsroomServerSideProps(context, {
            loadHomepageContacts: true,
        });

        const { query } = context;
        const page = query.page && typeof query.page === 'string' ? Number(query.page) : undefined;

        const { localeCode } = serverSideProps.newsroomContextProps;

        const storiesPaginated = await api.getStories({
            page,
            pageSize,
            include: extraStoryFields,
            localeCode,
        });
        const { stories, storiesTotal } = storiesPaginated;

        return processRequest(
            context,
            {
                ...serverSideProps,
                // TODO: This is temporary until return types from API are figured out
                stories: stories as StoryType[],
                pagination: {
                    itemsTotal: storiesTotal,
                    currentPage: page ?? 1,
                    pageSize,
                },
                ...(typeof customProps === 'function'
                    ? await (customProps as PropsFunction<CustomProps>)(context, serverSideProps)
                    : customProps),
            },
            '/',
        );
    };
}

export function getHomepageStaticProps<
    CustomProps extends Record<string, any>,
    StoryType extends Story = Story,
>(customProps: CustomProps | PropsFunction<CustomProps, GetStaticPropsContext>, options?: Options) {
    const { pageSize = DEFAULT_PAGE_SIZE, extraStoryFields } = options || {};

    return async function getStaticProps(
        context: GetStaticPropsContext,
    ): Promise<GetStaticPropsResult<HomePageProps<StoryType> & CustomProps>> {
        const { api, staticProps } = await getNewsroomStaticProps(context, {
            loadHomepageContacts: true,
        });

        const { localeCode } = staticProps.newsroomContextProps;

        const storiesPaginated = await api.getStories({
            pageSize,
            include: extraStoryFields,
            localeCode,
        });
        const { stories, storiesTotal } = storiesPaginated;

        return processStaticRequest(context, {
            ...staticProps,
            // TODO: This is temporary until return types from API are figured out
            stories: stories as StoryType[],
            pagination: {
                itemsTotal: storiesTotal,
                currentPage: 1,
                pageSize,
            },
            ...(typeof customProps === 'function'
                ? await (customProps as PropsFunction<CustomProps, GetStaticPropsContext>)(
                      context,
                      staticProps,
                  )
                : customProps),
        });
    };
}
