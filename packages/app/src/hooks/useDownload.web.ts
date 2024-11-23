import React from "react";

export type TDownloadContext = ReturnType<typeof useDownload>
export const DownloadContext = React.createContext<TDownloadContext>({} as TDownloadContext);
export const useDownloadContext = () => React.useContext(DownloadContext);

// no-op for web
export const useDownload = (props: { getVideoUrl: (url: string, provider: string) => Promise<string | undefined> }) => {
    return {
        state: {},
        actions: {}
    } as any
}