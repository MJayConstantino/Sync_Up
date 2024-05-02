import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProgressCircle from 'react-native-progress-circle';


export function ProjectCard({project, navigation}) {
  const handleNavigation = (screen, params) => {
    navigateToNestedRoute(getScreenParent(screen), screen, params);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handleNavigation('Project', project)}>
      <Text style={styles.projectTitle}>{project?.title}</Text>
      <View style={styles.projectTeamAndProgress}>
        <View>
          <Text style={styles.projectDescription}>{project?.description}</Text>
          <Text style={styles.projectTeamTitle}>Team</Text>
          <View style={styles.projectTeamWrapper}>
            {project?.team?.map(member => (
              <Image
                key={shortid.generate()}
                style={styles.projectMemberPhoto}
                source={{uri: member?.photo}}
              />
            ))}
            <TouchableOpacity style={styles.plusBtnContainer}>
              <MaterialCommunityIcons name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <ProgressCircle
          percent={project?.progress}
          radius={40}
          borderWidth={8}
          color="#6AC67E"
          shadowColor="#f4f4f4"
          bgColor="#fff">
          <Text style={styles.projectProgress}>{project?.progress}%</Text>
        </ProgressCircle>
      </View>
      <View style={styles.rowJustifyBetween}>
        <View style={styles.flexRow}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color={appTheme.INACTIVE_COLOR}
          />
          <Text style={styles.projectBottomText}>{project?.createdAt}</Text>
        </View>
        <View style={styles.flexRow}>
          <MaterialCommunityIcons
            name="checkbox-marked"
            size={20}
            color={appTheme.INACTIVE_COLOR}
          />
          <Text style={styles.projectBottomText}>{project?.tasks} Tasks</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 10,
      height: 180,
      borderRadius: 7,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      elevation: 1,
      margin: 1,
      marginBottom: 25,
    },
    projectTitle: {
      fontWeight: 'bold',
      fontSize: 17,
      marginBottom: 5,
    },
    projectTeamAndProgress: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    projectDescription: {
      color: appTheme.INACTIVE_COLOR,
      marginBottom: 10,
    },
    projectTeamTitle: {fontWeight: 'bold', marginBottom: 5},
    projectTeamWrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 10
    },
    projectMemberPhoto: {
      height: 40,
      width: 40,
      borderRadius: 50,
      marginLeft: -10,
    },
    projectProgress: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    rowJustifyBetween: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    flexRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectBottomText: {
      marginLeft: 5,
      fontSize: 14,
    },  
    plusBtnContainer: {
      backgroundColor: appTheme.COLOR1,
      height: 40,
      width: 40,
      borderRadius: 50,
      marginLeft: -10,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  