import React from 'react';
import IssueCard from './IssueCard';
import Loading from '../common/Loading';

const IssueList = ({ issues, loading, error }) => {
  if (loading) {
    return <Loading message="Loading issues..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="empty-container">
        <p className="empty-message">No issues found</p>
      </div>
    );
  }

  // Ensure issues is an array
  const issuesArray = Array.isArray(issues) ? issues : [];

  return (
    <div className="issue-list">
      {issuesArray.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};

export default IssueList;