import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, Image, Switch, Text, TouchableHighlight, View } from "react-native"

import { i18n } from '../../i18n';
import { Button } from '../components';
import { imgAssets, theme } from '../utils';
import { RootStackParamList } from './types';
import { DownloadList as TDownloadList } from '../hooks/useDownload';
import { useDownloadContext, useVideoContext } from '../hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export const LibraryScreen = (props: Props) => {

    const {
        state: {
            storage,
            downloadList,
        },
        actions: {
            clearStorage,
            deleteDownload,
        }
    } = useDownloadContext()

    const [editMode, setEditMode] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selectedDelete, setSelectedDelete] = useState<TDownloadList>({})
    const selectedCount = Object.keys(selectedDelete).length
    const downloadCount = Object.keys(downloadList).length

    return (
        <View style={{ flex: 1, position: 'relative', backgroundColor: theme.blackA() }}>

            {deleting && <DeleteLoader />}

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                {!editMode ?
                    <Header canEdit={downloadCount > 0}
                        onEditPress={() => setEditMode(true)}
                    /> :
                    <EditHeader
                        selectedCount={selectedCount}
                        totalCount={downloadCount}
                        onSelectAllPress={() => {
                            const allSelected = selectedCount === downloadCount
                            if (allSelected) {
                                setSelectedDelete({})
                            } else {
                                setSelectedDelete(JSON.parse(JSON.stringify(downloadList)))
                            }
                        }}
                        onClosePress={() => {
                            setEditMode(false)
                            setSelectedDelete({})
                        }}
                    />
                }
            </View>

            <DownloadList
                props={props}
                editMode={editMode}
                selectedDelete={selectedDelete}
                setSelectedDelete={setSelectedDelete}
            />

            {
                editMode ?
                    <DeleteButton onPress={() => {
                        if (!selectedCount) {
                            return
                        }

                        Alert.alert(
                            i18n.t('deleteDownload'),
                            `${selectedCount} ${i18n.t('itemsWillBeDeleted')}`
                            , [
                                {
                                    text: i18n.t('cancel'),
                                    style: 'cancel',
                                },
                                {
                                    text: i18n.t('ok'),
                                    onPress: async () => {
                                        setDeleting(true)
                                        await deleteDownload(selectedDelete)
                                        setDeleting(false)
                                        setEditMode(false)
                                    }
                                },
                            ])
                    }} />
                    :
                    <StorageBar
                        onPress={() => {
                            Alert.alert(
                                i18n.t('clearStorage'),
                                i18n.t('allItemDelete')
                                , [
                                    {
                                        text: i18n.t('cancel'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: i18n.t('ok'),
                                        onPress: async () => {
                                            setDeleting(true)
                                            await clearStorage()
                                            setDeleting(false)
                                        }
                                    },
                                ])
                        }}
                        storage={storage}
                    />
            }
        </View >
    )
}

const DeleteLoader = () => {
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 0,
                right: 0,
                left: 0,
                top: 0,
                zIndex: 99,
                backgroundColor: theme.whiteA(0.2)
            }}>
            <ActivityIndicator size={100} color={theme.primary} />
        </View>
    )
}

const Header: React.FC<{
    canEdit: boolean
    onEditPress: () => void
}> = ({ canEdit, onEditPress }) => {
    return (
        <View style={{ padding: 5, flex: 1, }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: theme.whiteA(), fontSize: 20 }}>
                    {i18n.t('downloads')}
                </Text>

                {
                    canEdit &&
                    <TouchableHighlight
                        style={{ marginBottom: 5 }}
                        onPress={onEditPress}
                    >
                        <Image
                            style={{ height: 24, width: 24 }}
                            resizeMode='contain'
                            source={imgAssets.edit}
                        />
                    </TouchableHighlight>
                }
            </View>
        </View>
    )
}

const EditHeader: React.FC<{
    selectedCount: number
    totalCount: number
    onSelectAllPress: () => void
    onClosePress: () => void
}> = ({ selectedCount, totalCount, onSelectAllPress, onClosePress }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>

            <TouchableHighlight
                onPress={onSelectAllPress}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ alignItems: 'center', marginRight: 10 }}>

                        {selectedCount === totalCount ?
                            <Image
                                style={{
                                    height: 24, width: 24,
                                }}
                                resizeMode='contain'
                                source={imgAssets.checked}
                            />
                            :
                            <View
                                style={{
                                    height: 24, width: 24,
                                    borderWidth: 1,
                                    borderColor: theme.whiteA(0.3),
                                    borderRadius: 999
                                }}
                            />
                        }
                        <Text style={{
                            color: theme.whiteA(), fontSize: 10,
                        }}>
                            {i18n.t('all')}
                        </Text>
                    </View>
                    <Text style={{ color: theme.whiteA(), fontSize: 16 }}>
                        {
                            selectedCount > 0 ?
                                selectedCount + ' ' + i18n.t('selected')
                                :
                                i18n.t('selectItems')
                        }
                    </Text>
                </View>
            </TouchableHighlight>
            <TouchableHighlight
                style={{ marginBottom: 5 }}
                onPress={onClosePress}
            >
                <Image
                    style={{ height: 24, width: 24 }}
                    resizeMode='contain'
                    source={imgAssets.close}
                />
            </TouchableHighlight>
        </View>
    )
}

const Settings = () => {
    const {
        state: {
            wifiOnly,
            autoDownload
        },
        actions: {
            toggleWifiOnly,
            toggleAutoDownload
        }
    } = useDownloadContext()

    return (
        <View
            style={{
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.whiteA(0.2),
            }}
        >
            <View
                style={{
                    marginTop: 10,
                    borderWidth: 1,
                    borderColor: theme.whiteA(0.7),
                    padding: 10,
                    width: '70%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Text style={{ color: theme.whiteA(0.7) }}>
                        {i18n.t('wifiOnly')}
                    </Text>
                    <Switch
                        trackColor={{ false: theme.whiteA(0.3), true: theme.whiteA(0.7) }}
                        thumbColor={wifiOnly ? theme.primary : theme.whiteA()}
                        onValueChange={toggleWifiOnly}
                        value={wifiOnly}
                    />
                </View>
                <View
                    style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Text style={{ color: theme.whiteA(0.7) }}>
                        {i18n.t('autoDownload')}
                    </Text>
                    <Switch
                        trackColor={{ false: theme.whiteA(0.3), true: theme.whiteA(0.7) }}
                        thumbColor={autoDownload ? theme.primary : theme.whiteA()}
                        onValueChange={toggleAutoDownload}
                        value={autoDownload}
                    />
                </View>
            </View>
        </View>
    )
}

const NoDownload = (props: Props) => {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
            <Image
                resizeMode='contain'
                source={imgAssets.nothing}
            />
            <Text style={{ color: theme.whiteA(), fontSize: 22, marginVertical: 5 }}>
                {i18n.t('noItemsFound')}
            </Text>
            <Text style={{ color: theme.whiteA(0.8), fontSize: 16, textAlign: 'center' }}>
                {i18n.t('noVideoDownloaded')}...!!!
            </Text>

            <Button
                onPress={() => {
                    props.navigation.navigate("Home")
                }}
                touchStyle={{
                    borderRadius: 10,
                    marginTop: 15,
                }}
                style={{
                    borderRadius: 10,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    backgroundColor: theme.whiteA(0.2),
                    flex: 0
                }}
                text={i18n.t('explore')}
            />
        </View>
    )
}

const DownloadList: React.FC<{
    setSelectedDelete: React.Dispatch<React.SetStateAction<TDownloadList>>
    selectedDelete: TDownloadList
    editMode: boolean,
    props: Props
}> = ({ setSelectedDelete, selectedDelete, editMode, props }) => {
    const {
        actions: {
            playOfflineVideo,
        },
    } = useVideoContext();

    const {
        state: {
            downloadList,
            downloading,
            progress,
        },
        actions: {
            startDownload,
            pauseDownload,
            checkDownloadExist,
            markDownloadMissing,
        }
    } = useDownloadContext()

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                ListHeaderComponent={Settings}
                ListEmptyComponent={NoDownload}
                data={Object.entries(downloadList)}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                    const [_, d] = item
                    const selected = selectedDelete[d.href]
                    return (
                        <TouchableHighlight
                            key={d.href}
                            onPress={async () => {
                                if (editMode) {
                                    if (selected) {
                                        delete selectedDelete[d.href]
                                    } else {
                                        selectedDelete[d.href] = d
                                    }
                                    setSelectedDelete(JSON.parse(JSON.stringify(selectedDelete)))
                                    return
                                }

                                if (!d.path) {
                                    return
                                }
                                const exist = await checkDownloadExist(d)
                                if (exist) {
                                    props.navigation.navigate('Play', {
                                        local: true,
                                        video: {
                                            index: 0,
                                            ep: d.ep,
                                            url: d.path,
                                            title: d.name + " " + d.ep,
                                            source: '',
                                            eps: [],
                                        }
                                    })
                                } else {
                                    await markDownloadMissing(d)
                                }
                            }}
                        >
                            <View style={{
                                paddingVertical: 20,
                                borderBottomColor: theme.whiteA(0.2),
                                borderBottomWidth: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1,
                            }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    {editMode &&
                                        <>
                                            {selected ?
                                                <Image
                                                    style={{
                                                        height: 24, width: 24,
                                                    }}
                                                    resizeMode='contain'
                                                    source={imgAssets.checked}
                                                />
                                                :
                                                <View
                                                    style={{
                                                        height: 24, width: 24,
                                                        borderWidth: 1,
                                                        borderColor: theme.whiteA(0.3),
                                                        borderRadius: 999
                                                    }}
                                                />
                                            }
                                        </>
                                    }

                                    <Text
                                        style={{
                                            marginLeft: 10,
                                            color: d.path ? theme.whiteA() : theme.whiteA(0.5)
                                        }}>
                                        {d.name + " " + d.ep}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    {

                                        d.path ?
                                            <Image
                                                style={{ height: 24, width: 24 }}
                                                resizeMode='contain'
                                                source={imgAssets.ok}
                                            />
                                            :
                                            d.href === downloading ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ color: theme.primary }}>
                                                        {progress}
                                                    </Text>
                                                    <TouchableHighlight
                                                        onPress={() => {
                                                            if (editMode) {
                                                                return
                                                            }
                                                            pauseDownload()
                                                        }}
                                                    >
                                                        <Image
                                                            style={{
                                                                marginLeft: 10,
                                                                width: 28,
                                                                height: 28,
                                                            }}
                                                            resizeMode='contain'
                                                            source={imgAssets.pause}
                                                        />
                                                    </TouchableHighlight>
                                                </View>
                                                :
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text style={{ color: theme.whiteA(0.5) }}>
                                                        {i18n.t('downloadPaused')}
                                                    </Text>
                                                    <TouchableHighlight
                                                        onPress={() => {
                                                            if (editMode || d.failed) {
                                                                return
                                                            }
                                                            startDownload(d, true)
                                                        }}
                                                    >
                                                        <Image
                                                            style={{
                                                                marginLeft: 10,
                                                                width: 28,
                                                                height: 28,
                                                            }}
                                                            resizeMode='contain'
                                                            source={d.failed ? imgAssets.error : imgAssets.downloadRound}
                                                        />
                                                    </TouchableHighlight>
                                                </View>
                                    }
                                </View>
                            </View>
                        </TouchableHighlight>
                    )
                }}
            />
        </View>
    )
}

const DeleteButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
    return (
        <TouchableHighlight
            onPress={onPress}
        >
            <View style={{
                marginTop: 'auto',
                alignItems: 'center',
                paddingVertical: 5,
                backgroundColor: theme.whiteA(0.2)
            }}>
                <Image
                    style={{
                        width: 28,
                        height: 28,
                    }}
                    resizeMode='contain'
                    source={imgAssets.delete}
                />
                <Text
                    style={{ color: theme.whiteA() }}
                >
                    {i18n.t('delete')}
                </Text>
            </View>
        </TouchableHighlight>
    )
}

const StorageBar: React.FC<{
    onPress: () => void
    storage: string
}> = ({ onPress, storage }) => {
    return (
        <TouchableHighlight
            style={{
                backgroundColor: theme.whiteA(0.2),
                padding: 10,
                marginTop: 'auto'
            }}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: theme.whiteA() }}>{i18n.t('storageUsed')}:</Text>
                <Text style={{ color: theme.whiteA() }}>{storage}</Text>
            </View>
        </TouchableHighlight>
    )
}