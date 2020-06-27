const dateTimeOptions = { year: 'numeric', month: 'numeric', day: '2-digit', hour: 'numeric', minute:'2-digit'};

export const convertUTCDateToLocalDate = (dateString: string): string => {
    const date = new Date(dateString);
    var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000).toLocaleString([], dateTimeOptions);
    return newDate;
}
