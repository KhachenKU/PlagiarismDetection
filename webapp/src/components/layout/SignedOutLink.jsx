import React from 'react'
import { NavLink } from 'react-router-dom'

const SignedOutLinks = () => {
    return (
        <ul className="right">
            <li><NavLink to='/signup'>สมัครสมาชิก</NavLink></li>
            <li><NavLink to='/signin'>เข้าสู่ระบบ</NavLink></li>
        </ul>
    )
}

export default SignedOutLinks