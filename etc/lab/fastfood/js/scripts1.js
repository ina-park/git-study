
var API_URL = 'https://floating-harbor-78336.herokuapp.com/fastfood';

$(function() {
    $('.btn-search').click(function(){
        $.get(API_URL, {}, function(data){
            
            var _list = data.list;
            var _total = data.total;

            $('.total').html('총 ' + _total + '개의 패스트푸드점을 찾았습니다.');

            var $list = $('.list');

            for (var i = 0; i < _list.length; i++) {
                var _item = _list[i];

                /*
                var $elem = $('#item-template');
                var $clone = $elem.clone();
                $clone.removeAttr('id');
                */
                var $elem = $('#item-template')
                .clone()
                .removeAttr('id');

                $elem.find('.item-no').html(i + 1);
                $elem.find('.item-name').html(_item.name);
                $elem.find('.item-addr').html(_item.addr);

                $list.append($elem);
            }

        });
    });
});
