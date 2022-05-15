module.exports = {
    format_date: date => {
        return `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}/${new Date(
            date
        ).getFullYear()}`;
    },
    format_plural: (word, amount) => {
        if (amount !== 1) {
            return `${word}s`;
        }

        return word;
    },
    format_url: url => {
        return url
            .replace('http://', '')
            .replace('https://', '')
            .replace('www.', '')
            .split('/')[0]
            .split('?')[0];
    },
    format_business_hours: hours => {
        return hours.map(hour => {
            switch (hour) {
                case 12:
                    return '12:00 pm'
                case 13:
                    return '1:00 pm'
                case 14:
                    return '2:00 pm'
                case 15:
                    return '3:00 pm'
                case 16:
                    return '4:00 pm'
                case 17:
                    return '5:00 pm'
                case 18:
                    return '6:00 pm'
                case 19:
                    return '7:00 pm'
                case 20:
                    return '8:00 pm'
                case 21:
                    return '9:00 pm'
                case 22:
                    return '10:00 pm'
                case 23:
                    return '11:00 pm'
                default:
                    return `${hour}:00 am`
            }

        })
    }
}