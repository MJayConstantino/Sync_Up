import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { firebase } from '../../firebase-config';
import Schedule from '../components/Schedules/Schedule';
import TaskSchedule from '../components/Schedules/TaskSchedule';
import AddScheduleModal from '../components/Schedules/AddSchedule';
import ClassSchedule from '../components/Schedules/ClassSchedule';
import ProjectSchedule from '../components/Schedules/ProjectSchedule';
import ProjectTaskSchedule from '../components/Schedules/ProjectTaskSchedule';
import { getDayOfYear, startOfISOWeek } from 'date-fns';

const firestore = firebase.firestore();

const FilterButtons = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  return (
    <View style={styles.filterContainer}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'ALL' && styles.selectedFilterButton]}
          onPress={() => handleFilterPress('ALL')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'ALL' && styles.selectedFilterButtonText]}>ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Events' && styles.selectedFilterButton]}
          onPress={() => handleFilterPress('Events')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'Events' && styles.selectedFilterButtonText]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Projects' && styles.selectedFilterButton]}
          onPress={() => handleFilterPress('Projects')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'Projects' && styles.selectedFilterButtonText]}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Tasks' && styles.selectedFilterButton]}
          onPress={() => handleFilterPress('Tasks')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'Tasks' && styles.selectedFilterButtonText]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'ClassSchedules' && styles.selectedFilterButton]}
          onPress={() => handleFilterPress('ClassSchedules')}
        >
          <Text style={[styles.filterButtonText, selectedFilter === 'ClassSchedules' && styles.selectedFilterButtonText]}>Class Schedules</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const ScheduleScreen = ({ navigation, route }) => {
  const [items, setItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addedSchedule, setAddedSchedule] = useState(false);
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);
  const { params = {} } = route;
  const { filter: initialFilter = 'ALL' } = params;
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    const fetchSchedulesAndTasks = async () => {
      try {
        const unsubscribeFromSchedules = firestore
          .collection(`users/${currentUser.uid}/schedules`)
          .orderBy("timeValue", "asc")
          .onSnapshot(snapshot => {
            const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'schedule' }));

            const unsubscribeFromTasks = firestore
              .collection(`users/${currentUser.uid}/tasks`)
              .orderBy("timeValue", "asc")
              .onSnapshot(snapshot => {
                const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'task' }));

                const unsubscribeFromClassSchedules = firestore
                  .collection(`users/${currentUser.uid}/classSchedules`)
                  .orderBy("timeValue", "asc")
                  .onSnapshot(snapshot => {
                    const classSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'classSchedule' }));

                    const unsubscribeFromProjects = firestore
                      .collection('projects')
                      .where('collaborators', 'array-contains', currentUser.uid)
                      .onSnapshot(snapshot => {
                        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'project' }));

                        projects.forEach(project => {
                          const unsubscribeFromProjectTasks = firestore
                            .collection(`projects/${project.id}/tasks`)
                            .where('assignedTo', 'array-contains', currentUser.uid)
                            .onSnapshot(taskSnapshot => {
                              const projectTasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'projectTask' }));

                              const combinedItems = {};

                              schedules.forEach(schedule => {
                                const date = schedule.date;
                                if (!combinedItems[date]) {
                                  combinedItems[date] = [];
                                }
                                combinedItems[date].push(schedule);
                              });

                              tasks.forEach(task => {
                                const date = task.date;
                                if (!combinedItems[date]) {
                                  combinedItems[date] = [];
                                }
                                combinedItems[date].push(task);
                              });

                              classSchedules.forEach(classSchedule => {
                                const days = Array.isArray(classSchedule.day) ? classSchedule.day : [classSchedule.day];
                                days.forEach(day => {
                                  const occurrences = getOccurrencesOfMonth(day); 
                                  occurrences.forEach(date => {
                                    if (!combinedItems[date]) {
                                      combinedItems[date] = [];
                                    }
                                    combinedItems[date].push(classSchedule);
                                  });
                                });
                              });

                              projects.forEach(project => {
                                const projectTasks = project.tasks || [];
                                combinedItems[project.deadline] = combinedItems[project.deadline] || [];
                                combinedItems[project.deadline].push(project);

                                projectTasks.forEach(projectTask => {
                                  const date = projectTask.date;
                                  if (!combinedItems[date]) {
                                    combinedItems[date] = [];
                                  }
                                  combinedItems[date].push(projectTask);
                                });
                              });

                              setItems(combinedItems);
                            });

                          return unsubscribeFromProjectTasks;
                        });
                      });

                    return unsubscribeFromProjects;
                  });

                return unsubscribeFromClassSchedules;
              });

            return unsubscribeFromTasks;
          });

        return unsubscribeFromSchedules;
      } catch (error) {
        console.error("Error fetching schedules and tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedulesAndTasks();
  }, [currentUser.uid, addedSchedule, filter]);

  const getOccurrencesOfMonth = (dayOfWeek) => {
    const today = new Date();
    const dayOfWeekIndex = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', ].indexOf(dayOfWeek);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const occurrences = [];

    for (let date = firstDayOfMonth; date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
      if (date.getDay() === dayOfWeekIndex) {
        occurrences.push(date.toISOString().split('T')[0]);
      }
    }

    return occurrences;
  };

  const addNewSchedule = async (newSchedule) => {
    try {
      await firestore.collection(`users/${currentUser.uid}/schedules`).add(newSchedule);
      console.log("Schedule added successfully!");
      setIsModalVisible(false);
      setAddedSchedule()
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };
  

  const renderItem = (item, isFirst) => {
    const backgroundColor = item.type === 'schedule' ? 'yellow'
      : item.type === 'task' || item.type === 'projectTask' ? 'blue'
      : item.type === 'project' ? 'red'
      : item.type === 'classSchedule' ? 'green'
      : 'gray';
  
    const borderColor = isFirst ? backgroundColor : 'transparent';
  
    if (item.type === 'schedule') {
      return (
        <TouchableOpacity onPress={() => handleSchedulePress(item)}>
          <Schedule {...item} backgroundColor={backgroundColor} borderColor={borderColor} />
        </TouchableOpacity>
      );
    } else if (item.type === 'task') {
      return (
        <TouchableOpacity onPress={() => handleTaskPress(item)}>
          <TaskSchedule {...item} backgroundColor={backgroundColor} borderColor={borderColor} />
        </TouchableOpacity>
      );
    } else if (item.type === 'classSchedule') {
      return (
        <TouchableOpacity onPress={() => handleClassSchedulePress(item)}>
          <ClassSchedule {...item} backgroundColor={backgroundColor} borderColor={borderColor} />
        </TouchableOpacity>
      );
    } else if (item.type === 'project') {
      return (
        <TouchableOpacity onPress={() => handleProjectPress(item)}>
          <ProjectSchedule {...item} backgroundColor={backgroundColor} borderColor={borderColor} />
        </TouchableOpacity>
      );
    } else if (item.type === 'projectTask') {
      return (
        <TouchableOpacity onPress={() => handleProjectTaskPress(item)}>
          <ProjectTaskSchedule {...item} backgroundColor={backgroundColor} borderColor={borderColor} />
        </TouchableOpacity>
      );
    }
  };

  const handleSchedulePress = (item) => {
    navigation.navigate('EditScheduleScreen', { scheduleId: item.id });
  };

  const handleTaskPress = (item) => {
    navigation.navigate('EditTaskScreen', { taskId: item.id });
  };

  const handleClassSchedulePress = (item) => {
    navigation.navigate('EditClassScheduleScreen', { classScheduleId: item.id });
  };

  const handleProjectPress = (item) => {
    navigation.navigate('EditProjectScreen', { projectId: item.id });
  };

  const handleProjectTaskPress = (item) => {
    navigation.navigate('EditProjectTaskScreen', { projectTaskId: item.id });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filterItems = (items, filter) => {
    if (filter === 'ALL') {
      return items;
    }

    const filteredItems = {};

    Object.entries(items).forEach(([date, dateItems]) => {
      const filteredDateItems = dateItems.filter((item) => {
        if (filter === 'Events') {
          return item.type === 'schedule';
        } else if (filter === 'Projects') {
          return item.type === 'project';
        } else if (filter === 'Tasks') {
          return item.type === 'task' || item.type === 'projectTask';
        } else if (filter === 'ClassSchedules') {
          return item.type === 'classSchedule';
        }
      });

      if (filteredDateItems.length > 0) {
        filteredItems[date] = filteredDateItems;
      }
    });

    return filteredItems;
  };

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="#00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <FilterButtons onFilterChange={handleFilterChange} />
        <Agenda
          items={filterItems(items, filter)}
          renderItem={renderItem}
        />

      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Schedule</Text>
      </TouchableOpacity>

      <AddScheduleModal 
        isVisible={isModalVisible} 
        onDismiss={() => setIsModalVisible(false)} 
        onSave={addNewSchedule} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 25
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#00adf5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    elevation: 4,
    paddingVertical: 5,
  },
  filterScrollContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    maxHeight: 50
  },
  filterButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  selectedFilterButton: {
    backgroundColor: '#00adf5',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#333',
  },
  selectedFilterButtonText: {
    color: '#fff',
  },
});

export default ScheduleScreen;
