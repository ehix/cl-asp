var monitor, words, sentences, indices;

function getMonitorWords() {
    $.ajax({
        url: "get_monitor_words",
        async: false,
        data: {
            "monitor_id": monitor,
        },
        success: function(data) {
            words = JSON.parse(data)['response']
        }
    });
}

function getBatchSentences(batchSize, isUpdate, rmId = null) {
    $.ajax({
        url: "get_batch_sentences",
        async: false,
        data: {
            "monitor_id": monitor,
            "batch_size": batchSize
        },
        success: function(data) {
            if (isUpdate) {
                sentences.splice(rmId, 1, JSON.parse(data)['sentence'][0]);
                indices.splice(rmId, 1, JSON.parse(data)['indices'][0]);
            } else {
                sentences = JSON.parse(data)['sentence'];
                indices = JSON.parse(data)['indices'];
            }
        }
    });
}

function getQueueLength() {
    var length
    $.ajax({
        url: "get_queue_length",
        async: false,
        data: {
            "monitor_id": monitor,
        },
        success: function(data) {
            length = JSON.parse(data)['response'];
        }
    });
    return length
}

function annotateSentences(monitorId) {
    monitor = monitorId
    $('#document-taskview div').empty();
    var view = document.getElementById("document-taskview")

    getMonitorWords()
    if (words.length == 0) {
        var message = document.createElement('div');
        message.innerHTML = "<br><span>Nothing yet to annotate..</span>";
        view.appendChild(message);

    } else {
        getBatchSentences(10, false)
        stageTasks()
        markWords()
    }
}

function stageTasks() {
    $('#document-taskview div').empty();
    var taskStage = document.getElementById("task-stage");
    var queueLength = getQueueLength()

    for (var i = 0; i < sentences.length; i++) {
        var wrapper = document.createElement('div');
        wrapper.className = 'task-wrapper';

        var sentence = document.createElement('div');
        sentence.className = 'sentence wrapper';
        sentence.style = "height:100px; width:100%; padding: 10px";
        sentence.innerHTML = "<p class='sentence-text' align='justify'>" + sentences[i] + "</p>";

        var taskReference = document.createElement('span');
        taskReference.style = "padding: 10px;";
        taskReference.innerHTML = "No." + (i + 1).toString() + "/" + queueLength;

        var indexReference = document.createElement('span');
        indexReference.style = "padding: 10px;";
        indexReference.innerHTML = "#" + indices[i].toString();

        wrapper.appendChild(taskReference);
        wrapper.appendChild(indexReference);
        wrapper.appendChild(sentence);

        var options = document.getElementById("task-wrapper-options");
        clone = options.cloneNode(true);
        clone.id = indices[i];

        wrapper.appendChild(clone);
        taskStage.appendChild(wrapper);
    }

}

function markWords() {
    // https://markjs.io/configurator.html
    // mark.js highlights words passed from monitor.
    var instance = new Mark(document.querySelector("#task-stage"));
    instance.mark(words, {
        accuracy: "exactly"
    });
}

function update(rmVal, monitor) {
    rmId = indices.findIndex(e => e == rmVal)
    getBatchSentences(1, true, rmId)
    stageTasks()
    markWords()
    updateHistory(monitor) //@index.html
}

function processAnnotation(id) {
    var options = ["update_accept", "update_reject", "update_skip"]
    var iref = id.parentNode.id
    id.parentNode.parentNode.remove()
    $.ajax({
        url: options[$(id).val()],
        data: {
            "monitor_id": monitor,
            "index": iref,
        },
        success: function(data) {
            response = JSON.parse(data)['response'];
            if (response) {
                console.log(options[$(id).val()] + " complete")
                update(iref, monitor)
            }
        }
    });
}
