import {
    ClearStorageSettingsRow,
    SettingsModal as ConnectSettingsModal,
    DocumentSelectSettingsRow,
} from '@powerhousedao/design-system';
import { DocumentModel } from 'document-model/document';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Option } from 'react-multi-select-component';
import { useModal } from 'src/components/modal';
import { useDocumentDriveServer } from 'src/hooks/useDocumentDriveServer';
import { useFeatureFlag } from 'src/hooks/useFeatureFlags';
import {
    useDocumentModels,
    useFilteredDocumentModels,
} from 'src/store/document-model';

const mapDocumentModelsToOptions = (documentModels: DocumentModel[]) =>
    documentModels.map(document => ({
        label: document.documentModel.name,
        value: document.documentModel.id,
    }));

export interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = props => {
    const { open, onClose } = props;
    const { clearStorage } = useDocumentDriveServer();
    const { t } = useTranslation();
    const enabledDocuments = useFilteredDocumentModels();
    const documentModels = useDocumentModels();
    const { setConfig } = useFeatureFlag();
    const { showModal } = useModal();
    const [selectedDocuments, setSelectedDocuments] = useState<Option[]>(
        mapDocumentModelsToOptions(enabledDocuments),
    );

    const onSaveHandler = () => {
        setConfig({
            editors: {
                enabledEditors: selectedDocuments.map(
                    doc => doc.value as string,
                ),
            },
        });

        onClose();
    };

    const onClearStorage = () => {
        showModal('confirmationModal', {
            title: t('modals.connectSettings.clearStorage.confirmation.title'),
            body: t('modals.connectSettings.clearStorage.confirmation.body'),
            cancelLabel: t('common.cancel'),
            continueLabel: t(
                'modals.connectSettings.clearStorage.confirmation.clearButton',
            ),
            onContinue: () => {
                clearStorage().catch(console.error);
                showModal('settingsModal', {});
            },
            onCancel: () => showModal('settingsModal', {}),
        });
    };

    return (
        <ConnectSettingsModal
            open={open}
            title={t('modals.connectSettings.title')}
            body={t('modals.connectSettings.body')}
            cancelLabel={t('common.cancel')}
            saveLabel={t('common.save')}
            onSave={onSaveHandler}
            onOpenChange={status => {
                if (!status) return onClose();
            }}
        >
            <DocumentSelectSettingsRow
                selected={selectedDocuments}
                onChange={selectedDocs => setSelectedDocuments(selectedDocs)}
                options={mapDocumentModelsToOptions(documentModels)}
                title={t('modals.connectSettings.enabledDocumentTypes.title')}
                description={t(
                    'modals.connectSettings.enabledDocumentTypes.description',
                )}
                selectProps={{
                    overrideStrings: {
                        allItemsAreSelected: t(
                            'modals.connectSettings.enabledDocumentTypes.allSelected',
                        ),
                    },
                }}
            />
            <ClearStorageSettingsRow
                onClearStorage={onClearStorage}
                buttonLabel={t('modals.connectSettings.clearStorage.button')}
                description={t(
                    'modals.connectSettings.clearStorage.description',
                )}
            />
        </ConnectSettingsModal>
    );
};
