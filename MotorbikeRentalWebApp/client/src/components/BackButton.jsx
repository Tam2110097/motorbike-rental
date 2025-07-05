import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const BackButton = ({ path }) => {
    return (
        <div className="mb-4">
            <Link to={path}>
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    size="large"
                >
                    Quay lại
                </Button>
            </Link>
        </div>
    )
}

export default BackButton
