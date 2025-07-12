import React from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const RemoveButton = ({ onClick }) => (
    <Tooltip title="Xóa loại xe này">
        <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onClick}
            size="small"
            style={{ marginLeft: 8 }}
        />
    </Tooltip>
);

export default RemoveButton;
