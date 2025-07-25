import React from 'react'
import { AudioOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
const { Search } = Input;

const SearchTool = () => {
    const suffix = (
        <AudioOutlined
            style={{
                fontSize: 16,
                color: '#1677ff',
            }}
        />
    );
    const onSearch = (value, _e, info) =>
        console.log(info === null || info === void 0 ? void 0 : info.source, value);
    return (
        <Space direction="vertical">
            <Search placeholder="input search text" onSearch={onSearch} style={{ width: 200 }} />
            <Search placeholder="input search text" allowClear onSearch={onSearch} style={{ width: 200 }} />
            <Search
                addonBefore="https://"
                placeholder="input search text"
                allowClear
                onSearch={onSearch}
                style={{ width: 304 }}
            />
            <Search placeholder="input search text" onSearch={onSearch} enterButton />
            <Search
                placeholder="input search text"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
            />
            <Search
                placeholder="input search text"
                enterButton="Search"
                size="large"
                suffix={suffix}
                onSearch={onSearch}
            />
        </Space>
    )
}

export default SearchTool
