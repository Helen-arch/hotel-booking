<script>
import moment from 'moment';
import 'moment-timezone';
import { getReservations } from './reservations';

export default {
  components: {
    
  },
  data() {
    return {
      startDate: moment().startOf('week'),
      currentWeek: [],
      reservations: [],
      suites: [],
    }
  },
  mounted() {
    moment.locale('en');
    moment.tz.setDefault('Europe/Warsaw');

    this.generateWeek();

    getReservations()
      .then((data) => {
        this.reservations = data;
        this.generateSuites();
      })
  },
  methods: {
    generateWeek() {
      this.currentWeek = Array(7).fill(null)
        .map((_, i) => this.startDate.clone().add(i, 'day').format('YYYY-MM-DD'));
    },
    generateSuites() {
      this.suites = this.reservations
        .map(reservation => reservation.roomDetails.name)
        .filter((name, index, self) => self.indexOf(name) === index);
    },
    getDayReservation(suite, date) {
      const lastDate = this.currentWeek[this.currentWeek.length - 1];
      let isStart;
      let isEnd;
      let width;
      let isFull;

      const reservation = this.reservations.find(({ start, end, roomDetails }) => {
        let duration = Date.parse(end) - Date.parse(start);
        duration = moment.duration(duration).asDays();

        isStart = date === start && !this.currentWeek.includes(end);
        isEnd = date === end && !this.currentWeek.includes(start);
        isFull = date === start;
        
        if (isStart && end > lastDate) {
            duration = Date.parse(lastDate) - Date.parse(start);
            duration = moment.duration(duration).asDays() + 0.5;
        };

        if (isEnd && start < this.currentWeek[0]) {
            duration = Date.parse(end) - Date.parse(this.currentWeek[0]);
            duration = moment.duration(duration).asDays() + 0.5;
        };

        width = (duration * 100) + '%' ;

        return roomDetails.name === suite && ( isStart || isEnd || isFull );
      });

      return {
        reservation,
        width,
        isStart,
        isEnd,
        isFull
      };
    },
    nextWeek() {
      this.startDate = this.startDate.clone().add(1, 'week').startOf('week');
    },
    prevWeek() {
      this.startDate = this.startDate.clone().subtract(1, 'week').startOf('week');
    },
    setToday() {
      this.startDate = moment().startOf('week');
    },
  },
  computed: {
    today() {
      return moment().format('YYYY-MM-DD');
    },
  },
  watch: {
    startDate() {
      this.generateWeek();
    }
  }
}
</script>
<template>
  <header class="header">
    <button class="toggle" @click="prevWeek">{{ '<' }}</button>
    <button class="toggle" @click="nextWeek">{{ '>' }}</button>
    <button class="toggle" @click="setToday">Today</button>
  </header>

  <main class="tableContainer">
    <table class="table">
      <thead>
        <tr>
          <th class="first"></th>
          <th
            v-for="day in currentWeek"
            :key="day"
            class="date"
            :class="{ today: day === today }"
          >
            {{ day }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="suite in suites" :key="suite">
          <td class="suite">{{ suite }}</td>
          <td
            v-for="day in currentWeek"
            :key="day"
            class="dayCell"
            :class="{ today: day === today }"
          >
            <div
              v-if="getDayReservation(suite, day).reservation"
              class="reservation"
              :style="{ width: getDayReservation(suite, day).width }"
              :class="{
                full: getDayReservation(suite, day).isFull,
                started: getDayReservation(suite, day).isStart,
                ended: getDayReservation(suite, day).isEnd,
              }"
            >
              {{ getDayReservation(suite, day).reservation.name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
  
</template>

<style scoped>
  .header {
    padding: 15px 15px;
  }

  .toggle {
    padding: 5px 15px;
    background-color: darkslategray;
    border-color: darkslategray;
    border-radius: 10%;
    color: white;
    font-family: sans-serif;
    margin-right: 5px;
    cursor: pointer;
  }

  .tableContainer {
    padding-inline: 15px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .date {
    padding: 10px;
  }

  .suite {
    height: 130px;
    padding-left: 15px;
    color: green;
    font-weight: 600;
  }

  td, th:not(.first) {
    border: 1px solid cadetblue;
    font-family: sans-serif;
  }

  .today {
    background-color: lightgoldenrodyellow;
  }

  .dayCell {
    position: relative;
  }

  .reservation {
    position: absolute;
    bottom: 0;
    background-color: royalblue;
    height: 100px;
    z-index: 1;
    color: black;
    font-size: 16px;
    line-height: 100px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 8px;
  }

  .started {
    left: 50%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .ended {
    right: 50%;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .full {
    left: 50%;
  }
</style>