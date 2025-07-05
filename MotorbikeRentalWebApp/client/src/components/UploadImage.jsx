import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const UploadImage = ({ onFileSelect, initImage }) => {
  const [imageUrl, setImageUrl] = useState(initImage || null);

  useEffect(() => {
    if (initImage) {
      setImageUrl(initImage);
    }
  }, [initImage]); // Cập nhật nếu `initImage` thay đổi

  const handleSelectFile = (file) => {
    console.log("File được chọn:", file);
    const objectURL = URL.createObjectURL(file);
    setImageUrl(objectURL);
    onFileSelect(file); // Trả file về component cha
    return false; // Ngăn Ant Design tự động upload
  };

  return (
    <Upload listType="picture-card" showUploadList={false} beforeUpload={handleSelectFile}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="uploaded"
          style={{ width: "100%", height: "100px", objectFit: "cover" }}
        />
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Chọn ảnh</div>
        </div>
      )}
    </Upload>
  );
};

export default UploadImage;
