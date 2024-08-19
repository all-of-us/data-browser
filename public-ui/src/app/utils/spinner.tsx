import * as React from "react";

export const loadingCss = `
a:link,a:visited,a{
  color:#2aa3d8;
}
@keyframes load {
  from{background:transparent}
  to{background:#302c70}
}

.loading-dots {
    width:2rem;
    display:flex;
    height:auto;
    justify-content:space-between;
    padding-left: 1em;
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
}

.spinner-container {
  width:100%;
  display: flex;
  height: auto;
  align-content: center;
  align-items: center;
  justify-content: center;
  padding:1rem;
}

#circle2 {
  z-index:100;
  display: block;
  top: 50%;
  left: 50%;
  height: 50px;
  width: 50px;
  margin: -25px 0 0 -25px;
  border: 4px rgba(0, 0, 0, 0.2) solid;
  border-top: 4px rgb(0, 121, 184) solid;
  border-radius: 50%;
  -webkit-animation: spin2 1s infinite linear;
          animation: spin2 1s infinite linear;
}

@-webkit-keyframes spin2 {
  from {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
            transform: rotate(359deg);
  }
}
@keyframes spin2 {
  from {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
            transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
            transform: rotate(359deg);
  }
}

`;

export const Spinner = () => {
  return (
    <React.Fragment>
      <style>{loadingCss}</style>
      <div className="spinner-container">
        <div id="circle2"></div>
      </div>
    </React.Fragment>
  );
};

export const LoadingDots = () => {
  return (
    <React.Fragment>
      <style>{loadingCss}</style>
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </React.Fragment>
  );
};
