import React, { useState, useEffect } from 'react';
import { message, Image, Upload } from 'antd';

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const UploadImages = ({ value = [], onChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState(value);

  // 当外部 value 变化时更新内部 fileList
  useEffect(() => {
    setFileList(value);
  }, [value]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    const videoCount = newFileList.filter(
      file => VIDEO_TYPES.includes(file.type || file.originFileObj?.type)
    ).length;

    if (videoCount > 1) {
      message.error('最多只能上传一个视频');
      return;
    }
    setFileList(newFileList);
    // 通知父组件变化
    onChange?.(newFileList);
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

  const isValidFileType = (file) => {
    const type = file.type;
    // console.log("文件类型：", type)
    return IMAGE_TYPES.includes(type) || VIDEO_TYPES.includes(type);
  };

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        accept="image/*,video/*"
        beforeUpload={(file) => {
          const isValid = isValidFileType(file);
          if (!isValid) {
            message.error('只能上传图片或视频文件');
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
        }}
        itemRender={(originNode, file, currFileList) => {
          const isFirst = currFileList[0]?.uid === file.uid;
          return (
            <div style={{ position: 'relative' }}>
              {originNode}
              {isFirst && (
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'rgba(255, 69, 0, 0.8)',
                    color: 'white',
                    fontSize: 12,
                    padding: '2px 4px',
                    borderRadius: 4,
                    zIndex: 10,
                  }}
                >
                  封面
                </div>
              )}
            </div>
          );
        }}
      >
        {fileList.length >= 6 ? null : uploadButton}
      </Upload>

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default UploadImages;
