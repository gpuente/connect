import {
    FileItem as ConnectFileItem,
    FileItemProps,
    Icon,
    TreeItem,
    decodeID,
    defaultDropdownMenuOptions,
} from '@powerhousedao/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentDriveById } from 'src/hooks/useDocumentDriveById';
import { useDrivesContainer } from 'src/hooks/useDrivesContainer';
import { useGetDocumentById } from 'src/hooks/useGetDocumentById';
import { useGetReadableItemPath } from 'src/hooks/useGetReadableItemPath';
import { useOpenSwitchboardLink } from 'src/hooks/useOpenSwitchboardLink';
import { useUserPermissions } from 'src/hooks/useUserPermissions';
import { useModal } from '../modal';

const allowedItemOptions = ['delete', 'rename', 'duplicate'];

const defaultItemOptions = defaultDropdownMenuOptions.filter(option =>
    allowedItemOptions.includes(option.id),
);

interface IProps {
    file: TreeItem;
    drive: string;
    onFileSelected: (drive: string, id: string) => void;
    onFileDeleted: (drive: string, id: string) => void;
}

export const FileItem: React.FC<IProps> = ({ file, drive, onFileSelected }) => {
    const { t } = useTranslation();
    const [isWriteMode, setIsWriteMode] = useState(false);
    const getReadableItemPath = useGetReadableItemPath();
    const getDocumentById = useGetDocumentById();
    const { updateNodeName, onSubmitInput } = useDrivesContainer();
    const { showModal } = useModal();
    const { isAllowedToCreateDocuments } = useUserPermissions();

    const decodedDriveID = decodeID(drive);
    const openSwitchboardLink = useOpenSwitchboardLink(decodedDriveID);
    const { isRemoteDrive } = useDocumentDriveById(decodedDriveID);

    const onFileOptionsClick = async (optionId: string, fileNode: TreeItem) => {
        if (optionId === 'delete') {
            showModal('deleteItem', {
                driveId: decodedDriveID,
                itemId: fileNode.id,
                itemName: file.label,
                type: 'file',
            });
        }
        if (optionId === 'duplicate') {
            await onSubmitInput({
                ...file,
                action: 'UPDATE_AND_COPY',
            });
        }

        if (optionId === 'rename') {
            setIsWriteMode(true);
        }

        if (optionId === 'switchboard-link') {
            const document = getDocumentById(decodedDriveID, fileNode.id);

            await openSwitchboardLink(document);
        }
    };

    const itemOptions: FileItemProps['itemOptions'] = isRemoteDrive
        ? [
              {
                  id: 'switchboard-link',
                  label: t('files.options.switchboardLink'),
                  icon: (
                      <div className="flex w-6 justify-center">
                          <Icon name="drive" size={16} />
                      </div>
                  ),
              },
              ...defaultItemOptions,
          ]
        : defaultItemOptions;

    const cancelInputHandler = () => setIsWriteMode(false);
    const submitInputHandler = (value: string) => {
        setIsWriteMode(false);
        updateNodeName({ ...file, label: value }, decodedDriveID);
    };

    return (
        <ConnectFileItem
            key={file.id}
            title={file.label}
            subTitle={getReadableItemPath(file.id)}
            className="w-64"
            itemOptions={itemOptions}
            onCancelInput={cancelInputHandler}
            onSubmitInput={submitInputHandler}
            mode={isWriteMode ? 'write' : 'read'}
            onOptionsClick={optionId => onFileOptionsClick(optionId, file)}
            item={file}
            onClick={() =>
                !isWriteMode && onFileSelected(decodedDriveID, file.id)
            }
            isAllowedToCreateDocuments={isAllowedToCreateDocuments}
        />
    );
};

export default FileItem;
