export const ISSUE_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

export const ISSUE_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

export const USER_ROLES = {
    ADMIN: 'admin',
    PEOPLE: 'people'
};

export const STATUS_COLORS = {
    [ISSUE_STATUS.PENDING]: '#ffc107',
    [ISSUE_STATUS.IN_PROGRESS]: '#17a2b8',
    [ISSUE_STATUS.RESOLVED]: '#28a745',
    [ISSUE_STATUS.REJECTED]: '#dc3545'
};

export const PRIORITY_COLORS = {
    [ISSUE_PRIORITY.LOW]: '#28a745',
    [ISSUE_PRIORITY.MEDIUM]: '#ffc107',
    [ISSUE_PRIORITY.HIGH]: '#fd7e14',
    [ISSUE_PRIORITY.URGENT]: '#dc3545'
};