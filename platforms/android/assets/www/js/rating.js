$(document).ready(function () {
    $('li').on('click', function () {

        var otherStars = $(this).parent().children();
        otherStars.children('span').css('background-position', '0px 0px');
        var onStarLength = $(this).data('length');

        for (var i = 0; i < onStarLength; i++) {
            $(otherStars[i]).children('span').css('background-position', '22px 22px');
        }

        if (onStarLength <= 2) {
            $('p').fadeIn('slow').text("We apologise that you don't feel our service was upto your standards...");
        }
        else if (onStarLength >= 3) {
            $('p').fadeIn('slow').text("Thanks for rating our service so highly!");
        }
    });
});