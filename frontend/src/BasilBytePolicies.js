
import React from 'react';
import './BasilBytePolicies.css'; // Optional: For styling

function BasilBytePolicies() {
    return (
        <div className="policies-container">
            <h1>Data Retention Policy for Basil and Byte</h1>

            <section className="terms-content">
                <h2>1. Introduction</h2>
                <p>
                    This Data Retention Policy outlines the retention periods, data deletion or anonymization procedures, ownership rights of content, and compliance enforcement mechanisms for user data collected and stored by the Basil and Byte app. The policy ensures the privacy and security of users' personal data while adhering to legal, regulatory, and operational requirements.
                </p>

                <h2>2. Retention Periods</h2>
                <p>The following defines the retention periods for different types of data:</p>
                <ul>
                    <li>
                        <strong>Data Type:</strong> User-Generated Content (Recipes, Meal Plans, Favorites)<br />
                        <strong>Retention Period:</strong> Retained while account is active.<br />
                        <strong>Action After Retention Period:</strong> Delete within 6 months after account deletion. Data tied to deleted accounts will be anonymized or deleted.
                    </li>
                    <li>
                        <strong>Data Type:</strong> Shopping Lists and Meal History<br />
                        <strong>Retention Period:</strong> Retained for 3-6 months.<br />
                        <strong>Action After Retention Period:</strong> Auto-delete after the retention period.
                    </li>
                    <li>
                        <strong>Data Type:</strong> User Preferences and Dietary Settings<br />
                        <strong>Retention Period:</strong> Retained while the account is active.<br />
                        <strong>Action After Retention Period:</strong> Delete upon account deletion.
                    </li>
                </ul>

                <h2>3. Ownership of Content</h2>
                <p>By using Basil and Byte, users acknowledge and agree to the following ownership terms:</p>
                <ul>
                    <li>
                        <strong>All Recipes and Meal Plans:</strong> All recipes, meal plans, and related content (including but not limited to shopping lists, favorites, and user-generated data) that are created and uploaded within the Basil and Byte app become the exclusive property of Basil and Byte. This includes content shared by users while using the app, whether publicly or privately shared within the platform.
                    </li>
                    <li>
                        <strong>Rights Granted to Basil and Byte:</strong> By submitting or creating recipes and meal plans, users grant Basil and Byte a perpetual, worldwide, royalty-free, transferable license to use, modify, adapt, publish, or distribute the submitted content for any purpose, including promotional, commercial, or operational use within the app or related services.
                    </li>
                    <li>
                        <strong>Content Ownership Upon Account Deletion:</strong> After the deletion of a user's account, all recipes, meal plans, and other content submitted to the app will remain the property of Basil and Byte, even though the user's access to the app and its features may be revoked. Basil and Byte reserves the right to retain, anonymize, or continue using the content as described in this section.
                    </li>
                </ul>

                <h2>4. Data Deletion or Anonymization Process</h2>
                <p>To ensure compliance with data retention policies, the following processes will be employed:</p>
                <h3>Automated Deletion:</h3>
                <ul>
                    <li><strong>User-Generated Content:</strong> When an account is deleted, the associated recipes, meal plans, and favorites will be deleted or anonymized within 6 months.</li>
                    <li><strong>Shopping Lists & Meal History:</strong> These records will be automatically deleted from the system after 3-6 months from the date of the last use.</li>
                    <li><strong>User Preferences and Dietary Settings:</strong> These preferences will be deleted upon account deletion.</li>
                </ul>
                <h3>Anonymization Process:</h3>
                <p>
                    Where possible, user-generated content that is tied to a deleted account will be anonymized to ensure it cannot be attributed to any individual. Anonymization processes will involve the removal or encryption of personally identifiable information (PII) while maintaining the integrity of the content for analysis or other purposes.
                </p>
                <h3>Account Deletion:</h3>
                <p>
                    Once a user deletes their account, the system will trigger an automated cleanup process that ensures the deletion of all relevant user data within the specified retention period.
                </p>

                <h2>5. Compliance Enforcement</h2>
                <p>To ensure that the Data Retention Policy is enforced effectively, the following steps will be taken:</p>
                <ul>
                    <li><strong>Automatic Enforcement:</strong> The system will use automated tools to track retention periods and trigger deletion or anonymization processes as described in the policy. These tools will ensure that no data exceeds its retention period.</li>
                    <li><strong>Periodic Testing:</strong> A monthly automated system check will verify that no user data is retained longer than necessary. Any data that exceeds the retention period will be flagged for review and deletion.</li>
                    <li><strong>Audit Logs:</strong> Detailed logs of all data retention, deletion, and anonymization actions will be kept for audit purposes. These logs will record when data was retained, deleted, or anonymized, and the user’s account status at the time.</li>
                </ul>

                <h2>6. Audit & Review Procedures</h2>
                <p>To ensure compliance and continuous improvement of the data retention process, the following audit and review procedures will be implemented:</p>
                <ul>
                    <li><strong>Quarterly Audit:</strong> A quarterly audit will be conducted to review data retention practices, the deletion processes, and the effectiveness of the anonymization procedures. The audit will ensure that all data has been retained only for the required time and that proper cleanup procedures are followed.</li>
                    <li><strong>Annual Policy Review:</strong> On an annual basis, this Data Retention Policy will be reviewed to ensure its continued relevance and compliance with any new regulations, industry standards, or operational requirements. Any necessary adjustments will be made, and all stakeholders will be informed of changes.</li>
                    <li><strong>Compliance Verification:</strong> External audits may be conducted annually to verify the app’s compliance with privacy laws and data retention regulations (e.g., GDPR, CCPA). The team will work with compliance officers to implement any required changes.</li>
                </ul>

                <h2>7. Conclusion</h2>
                <p>
                    This Data Retention Policy ensures that Basil and Byte complies with legal and regulatory requirements while maintaining the privacy and security of user data. The retention periods, deletion processes, content ownership terms, compliance enforcement strategies, and audit procedures are designed to safeguard user data and provide transparency in how it is managed.
                </p>
            </section>
        </div>
    );
}

export default BasilBytePolicies;