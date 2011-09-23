function TodoList(options) {
    var options = $.extend({
	sortable: true,
	onchange: function (finished, unfinished) {},
    },options);
    
    var finished_list_element = $(".finished ul");
    var unfinished_list_element = $(".unfinished ul");
    var input_new_task = $("input[type=text]");
    
    $("form").bind("submit", function (event) {
        event.preventDefault();
        process_new_task_input(input_new_task);
    });
    
    // detect pre-loaded hash
    if(!window.location.hash)
    {
	onchange();
    }else if(window.location.hash != serialize())
    {
	unserialize(window.location.hash.substr(1));
    }
    
    input_new_task.focus();
    
    if(options.sortable == true)
    {
	    unfinished_list_element.sortable({
		items:'li:not(.add)',
		update: onchange
	    });
    }

    function process_new_task_input(input) { 
        var task_name = input.val();
        add_task(task_name);
        input.val("");
    }

    function add_task(task_name) {
        var new_task_element = create_task_element(task_name);
        move_task_element_to_unfinished(new_task_element);
    }

    function create_task_element(task_name) {
        var task_element = $("<li>");
        var checkbox_element = $("<input type='checkbox' id='"+task_name+"' />");
        var label_element = $("<label for='"+task_name+"'>").append(task_name);
        task_element.append(checkbox_element);
        task_element.append(label_element);  
        task_element.append(create_delete_element(task_element));
        return task_element;
    }
    
    function create_delete_element(task_element) {
        var a_delete_element = $("<a href='#'>x</a>");
        a_delete_element.click(function(event){
            event.preventDefault();
            if (window.confirm("Do you want to delete this task?")) {
                task_element.remove();
                onchange();
            }
        });
        return a_delete_element;
    }
    
    function move_task_element_to_finished(task_element, noupdate) {
        var checkbox_element = $("input", task_element);
        checkbox_element.unbind("change");
        checkbox_element.bind("change", function () {
            move_task_element_to_unfinished(task_element);
        });
        finished_list_element.append(task_element);
        if(!noupdate) onchange();
    }

    function move_task_element_to_unfinished(task_element, noupdate) {
        var checkbox_element = $("input", task_element);
        checkbox_element.unbind("change");
        checkbox_element.bind("change", function() {
            move_task_element_to_finished(task_element);
        });
        unfinished_list_element.append(task_element);
        if(!noupdate) onchange();
    }
    
    function onchange()
    {
	// change url.hash
	l = window.location;
	window.location = l.protocol+'//'+l.hostname+l.pathname+'?'+l.search+'#'+serialize();
	
	// invoke onchange
	if(typeof(options.onchange) === 'function')
	{
		options.onchange(unfinished_list_element, finished_list_element);
	}
    }
    
    function serialize() {
	var dump, dumped;
	dump = function(i,e) {
		e = $(e);
		dumped = dumped + '&' + escape(escape(e.attr('for')+''));
	};
	srlz = function (list) {
		dumped='';
		$('>li label', list).each(dump);
		return dumped;
	}
	
	hash = 'u'+srlz(unfinished_list_element)+'|f'+srlz(finished_list_element);
	if(hash == 'U|f') return '';
	return hash;
    }
    
    function unserialize(string)
    {
	restore = function(s)
	{
		var sign;
		items = s.split('&');
		for(var i=0; items.length > i; i++)
		{
			if(i==0)
			{
				sign = items[i];
				continue;
			}
			task = create_task_element(unescape(items[i]));
			
			move_task_element_to_unfinished(task, true);
			if(sign == 'f') {
				$('input', task).trigger('click').trigger('change');
			}
		}
	};
	
	list = string.split('|');
	restore(list[0]);
	restore(list[1]);
	
    }
}
