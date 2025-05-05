import React, { useEffect } from 'react';

const OauthRedirect = () => {

    useEffect(() => {
        let params = new URLSearchParams(document.location.search);
        let token = params.get("token");
        let email = params.get("email");
        localStorage.setItem("token", token);
        localStorage.setItem('userEmail', email);
        window.location.href = "/home";
    }, []);

    return (
        <div></div>
    );
};

export default OauthRedirect;
