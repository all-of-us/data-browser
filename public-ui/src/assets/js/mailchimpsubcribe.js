(function () {
  /* mailchimp button click */
  var mcbutton = document.querySelectorAll('.mailchimpbutton');
  var i;

  for (i = 0; i < mcbutton.length; i++) {
    mcbutton[i].addEventListener("click", function () {
      document.querySelector(".popup").classList.toggle("mcbutton");
    });
  }

  /* mailchimp button click close */
  var mcbuttonx = document.querySelectorAll('.popup .mcbuttonexit');
  var i;

  for (i = 0; i < mcbuttonx.length; i++) {
    mcbuttonx[i].addEventListener("click", function () {
      this.parentElement.classList.toggle("mcbutton");

    });
  }

})();
