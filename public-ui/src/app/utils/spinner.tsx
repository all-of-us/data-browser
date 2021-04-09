import * as React from 'react';

export const spinnerContainerCss = `
a:link,a:visited,a{
    color:#2aa3d8;
}
@keyframes load {
    from{background:transparent}
    to{background:#302c70}
}`;

export const spinnerCss = `
.spinner-container {
    width:100%;
    display: flex;
    height: auto;
    align-content: center;
    align-items: center;
    justify-content: center;
}`;

export const loadingCss = `
.loading-dots {
    margin-top:.25rem;
    width:2rem;
    display:flex;
    height:auto;
    justify-content:space-between;
}
.loading-dots .dot {
    width:.25rem;
    height:.25rem;
    background:transparent;
    border-radius: 50%;
    animation:load 1s linear infinite alternate;
}
.loading-dots .dot:first-of-type{
    animation-delay: .25s;
}
.loading-dots .dot:nth-of-type(2){
    animation-delay: .5s;
}
.loading-dots .dot:nth-of-type(3){
    animation-delay: .75s;
}
.loading-dots .dot:nth-of-type(4){
    animation-delay: 1s;
}`;

export const Spinner = () => {
    return <React.Fragment>
            <style>{spinnerCss}</style>
            <div className='spinner-container'>
            <span className='spinner'></span>
           </div>
           </React.Fragment>;
};

export const LoadingDots = () => {
    return <React.Fragment>
            <style>{loadingCss}</style>
            <div className='loading-dots'>
            <div className='dot'></div>
                <div className='dot'></div>
                <div className='dot'></div>
                <div className='dot'></div>
           </div>
           </React.Fragment>;
};

export const SpinnerContainer = ({loading, dots}) => {
    return <React.Fragment>
            <style>{spinnerContainerCss}</style>
            {loading && !dots && <Spinner/>}
            {loading && dots && <LoadingDots/>}
           </React.Fragment>;
};
