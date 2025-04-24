// src/screens/PoliciesScreen.js
// Displays the data retention policy for Basil and Byte.
// Static content, no API calls.

import React from 'react';
import { ScrollView, Text, View, StyleSheet, Dimensions } from 'react-native';

const PoliciesScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.title}>Data Retention Policy for Basil and Byte</Text>

                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        This Data Retention Policy outlines the retention periods, data deletion or anonymization procedures, ownership rights of content, and compliance enforcement mechanisms for user data collected and stored by the Basil and Byte app. The policy ensures the privacy and security of users' personal data while adhering to legal, regulatory, and operational requirements.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Retention Periods</Text>
                    <Text style={styles.paragraph}>
                        The following defines the retention periods for different types of data:
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Data Type:</Text> User-Generated Content (Recipes, Meal Plans, Favorites){'\n'}
                        <Text style={styles.bold}>Retention Period:</Text> Retained while account is active.{'\n'}
                        <Text style={styles.bold}>Action After Retention Period:</Text> Delete within 6 months after account deletion. Data tied to deleted accounts will be anonymized or deleted.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Data Type:</Text> Shopping Lists and Meal History{'\n'}
                        <Text style={styles.bold}>Retention Period:</Text> Retained for 3-6 months.{'\n'}
                        <Text style={styles.bold}>Action After Retention Period:</Text> Auto-delete after the retention period.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Data Type:</Text> User Preferences and Dietary Settings{'\n'}
                        <Text style={styles.bold}>Retention Period:</Text> Retained while the account is active.{'\n'}
                        <Text style={styles.bold}>Action After Retention Period:</Text> Delete upon account deletion.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Ownership of Content</Text>
                    <Text style={styles.paragraph}>
                        By using Basil and Byte, users acknowledge and agree to the following ownership terms:
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>All Recipes and Meal Plans:</Text> All recipes, meal plans, and related content (including but not limited to shopping lists, favorites, and user-generated data) that are created and uploaded within the Basil and Byte app become the exclusive property of Basil and Byte. This includes content shared by users while using the app, whether publicly or privately shared within the platform.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Rights Granted to Basil and Byte:</Text> By submitting or creating recipes and meal plans, users grant Basil and Byte a perpetual, worldwide, royalty-free, transferable license to use, modify, adapt, publish, or distribute the submitted content for any purpose, including promotional, commercial, or operational use within the app or related services.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Content Ownership Upon Account Deletion:</Text> After the deletion of a user's account, all recipes, meal plans, and other content submitted to the app will remain the property of Basil and Byte, even though the user's access to the app and its features may be revoked. Basil and Byte reserves the right to retain, anonymize, or continue using the content as described in this section.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Deletion or Anonymization Process</Text>
                    <Text style={styles.paragraph}>
                        To ensure compliance with data retention policies, the following processes will be employed:
                    </Text>
                    <Text style={styles.subSectionTitle}>Automated Deletion:</Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>User-Generated Content:</Text> When an account is deleted, the associated recipes, meal plans, and favorites will be deleted or anonymized within 6 months.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Shopping Lists & Meal History:</Text> These records will be automatically deleted from the system after 3-6 months from the date of the last use.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>User Preferences and Dietary Settings:</Text> These preferences will be deleted upon account deletion.
                    </Text>
                    <Text style={styles.subSectionTitle}>Anonymization Process:</Text>
                    <Text style={styles.paragraph}>
                        Where possible, user-generated content that is tied to a deleted account will be anonymized to ensure it cannot be attributed to any individual. Anonymization processes will involve the removal or encryption of personally identifiable information (PII) while maintaining the integrity of the content for analysis or other purposes.
                    </Text>
                    <Text style={styles.subSectionTitle}>Account Deletion:</Text>
                    <Text style={styles.paragraph}>
                        Once a user deletes their account, the system will trigger an automated cleanup process that ensures the deletion of all relevant user data within the specified retention period.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Compliance Enforcement</Text>
                    <Text style={styles.paragraph}>
                        To ensure that the Data Retention Policy is enforced effectively, the following steps will be taken:
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Automatic Enforcement:</Text> The system will use automated tools to track retention periods and trigger deletion or anonymization processes as described in the policy. These tools will ensure that no data exceeds its retention period.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Periodic Testing:</Text> A monthly automated system check will verify that no user data is retained longer than necessary. Any data that exceeds the retention period will be flagged for review and deletion.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Audit Logs:</Text> Detailed logs of all data retention, deletion, and anonymization actions will be kept for audit purposes. These logs will record when data was retained, deleted, or anonymized, and the user’s account status at the time.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Audit & Review Procedures</Text>
                    <Text style={styles.paragraph}>
                        To ensure compliance and continuous improvement of the data retention process, the following audit and review procedures will be implemented:
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Quarterly Audit:</Text> A quarterly audit will be conducted to review data retention practices, the deletion processes, and the effectiveness of the anonymization procedures. The audit will ensure that all data has been retained only for the required time and that proper cleanup procedures are followed.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Annual Policy Review:</Text> On an annual basis, this Data Retention Policy will be reviewed to ensure its continued relevance and compliance with any new regulations, industry standards, or operational requirements. Any necessary adjustments will be made, and all stakeholders will be informed of changes.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Compliance Verification:</Text> External audits may be conducted annually to verify the app’s compliance with privacy laws and data retention regulations (e.g., GDPR, CCPA). The team will work with compliance officers to implement any required changes.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Conclusion</Text>
                    <Text style={styles.paragraph}>
                        This Data Retention Policy ensures that Basil and Byte complies with legal and regulatory requirements while maintaining the privacy and security of user data. The retention periods, deletion processes, content ownership terms, compliance enforcement strategies, and audit procedures are designed to safeguard user data and provide transparency in how it is managed.
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const containerWidth = Math.min(windowWidth, 800);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece6db',
        alignItems: 'center',
        padding: windowWidth < 768 ? 16 : 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        flex: 1, // Ensure card takes up available space
    },
    scrollContent: {
        padding: 20, // Padding inside ScrollView to match card's internal spacing
        paddingBottom: 40, // Extra padding at the bottom to avoid content being cut off
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 20,
        color: '#555',
        marginVertical: 15,
    },
    subSectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 18,
        color: '#777',
        marginVertical: 10,
    },
    paragraph: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        lineHeight: 24,
        marginBottom: 15,
    },
    listItem: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        lineHeight: 24,
        marginBottom: 10,
    },
    bold: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 17.6, // 1.1em
        color: '#2e5436',
        fontWeight: 'bold',
    },
});

export default PoliciesScreen;