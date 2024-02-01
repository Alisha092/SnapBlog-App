$(".sidebar ul li").on('click', function () {
    $(".sidebar ul li.active").removeClass('active');
    $(this).addClass('active');
});

$('.open-btn').on('click', function () {
    $('.sidebar').addClass('active');

});


$('.close-btn').on('click', function () {
    $('.sidebar').removeClass('active');

})



document.addEventListener('DOMContentLoaded', function () {
    const topicSelect = document.getElementById('topicSelect');
    const newTopicInput = document.getElementById('newTopicInput');

    topicSelect.addEventListener('change', function () {
        if (topicSelect.value === 'addNew') {
            newTopicInput.classList.remove('d-none');
        } else {
            newTopicInput.classList.add('d-none');
        }
    });
});